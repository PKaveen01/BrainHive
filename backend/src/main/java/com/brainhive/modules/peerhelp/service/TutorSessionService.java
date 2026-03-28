package com.brainhive.modules.peerhelp.service;

import com.brainhive.modules.peerhelp.dto.TutorSessionResponseDTO;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TutorSessionService {

    @Autowired
    private TutorSessionRepository sessionRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private TutorProfileService tutorProfileService;

    /**
     * Get session by ID.
     */
    public TutorSessionResponseDTO getSessionById(Long sessionId) {
        TutorSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));
        return TutorSessionResponseDTO.fromEntity(session);
    }

    /**
     * Get session by help request ID.
     */
    public TutorSessionResponseDTO getSessionByRequestId(Long requestId) {
        TutorSession session = sessionRepository.findByHelpRequestId(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found for request ID: " + requestId));
        return TutorSessionResponseDTO.fromEntity(session);
    }

    /**
     * Get all sessions for a student.
     */
    public List<TutorSessionResponseDTO> getStudentSessions(Long studentId) {
        return sessionRepository.findByStudentId(studentId)
                .stream()
                .map(TutorSessionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all sessions for a tutor.
     */
    public List<TutorSessionResponseDTO> getTutorSessions(Long tutorId) {
        return sessionRepository.findByTutorId(tutorId)
                .stream()
                .map(TutorSessionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming sessions for a student.
     */
    public List<TutorSessionResponseDTO> getUpcomingStudentSessions(Long studentId) {
        return sessionRepository.findByStudentId(studentId)
                .stream()
                .filter(s -> !s.getIsCompleted() && s.getScheduledStartTime().isAfter(LocalDateTime.now()))
                .map(TutorSessionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming sessions for a tutor.
     */
    public List<TutorSessionResponseDTO> getUpcomingTutorSessions(Long tutorId) {
        return sessionRepository.findByTutorId(tutorId)
                .stream()
                .filter(s -> !s.getIsCompleted() && s.getScheduledStartTime().isAfter(LocalDateTime.now()))
                .map(TutorSessionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Start a session (record actual start time).
     */
    public TutorSessionResponseDTO startSession(Long sessionId, Long userId) {
        TutorSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        // Only tutor can start the session
        if (!session.getTutor().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the assigned tutor can start the session");
        }

        if (session.getIsCompleted()) {
            throw new IllegalArgumentException("Session is already completed");
        }

        if (session.getActualStartTime() != null) {
            throw new IllegalArgumentException("Session has already been started");
        }

        session.setActualStartTime(LocalDateTime.now());
        TutorSession saved = sessionRepository.save(session);
        return TutorSessionResponseDTO.fromEntity(saved);
    }

    /**
     * Complete a session.
     */
    public TutorSessionResponseDTO completeSession(Long sessionId, Long userId, String notes) {
        TutorSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        // Only tutor can complete the session
        if (!session.getTutor().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the assigned tutor can complete the session");
        }

        if (session.getIsCompleted()) {
            throw new IllegalArgumentException("Session is already completed");
        }

        session.setActualEndTime(LocalDateTime.now());
        session.setIsCompleted(true);
        if (notes != null && !notes.trim().isEmpty()) {
            session.setNotes(notes);
        }

        // Update the help request status
        HelpRequest request = session.getHelpRequest();
        request.setStatus(HelpRequestStatus.COMPLETED);
        helpRequestRepository.save(request);

        TutorSession saved = sessionRepository.save(session);

        // Update tutor's credibility score
        tutorProfileService.updateCredibilityScore(session.getTutor().getId());

        return TutorSessionResponseDTO.fromEntity(saved);
    }

    /**
     * Update session notes.
     */
    public TutorSessionResponseDTO updateNotes(Long sessionId, Long userId, String notes) {
        TutorSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        // Only tutor or student can update notes
        if (!session.getTutor().getId().equals(userId) && !session.getStudent().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update notes for this session");
        }

        session.setNotes(notes);
        TutorSession saved = sessionRepository.save(session);
        return TutorSessionResponseDTO.fromEntity(saved);
    }

    /**
     * Update meeting link.
     */
    public TutorSessionResponseDTO updateMeetingLink(Long sessionId, Long tutorId, String meetingLink) {
        TutorSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + sessionId));

        if (!session.getTutor().getId().equals(tutorId)) {
            throw new IllegalArgumentException("Only the assigned tutor can update the meeting link");
        }

        session.setMeetingLink(meetingLink);
        TutorSession saved = sessionRepository.save(session);
        return TutorSessionResponseDTO.fromEntity(saved);
    }

    /**
     * Get completed sessions count for a tutor.
     */
    public Long getCompletedSessionsCount(Long tutorId) {
        return sessionRepository.countCompletedSessionsByTutor(tutorId);
    }
}
