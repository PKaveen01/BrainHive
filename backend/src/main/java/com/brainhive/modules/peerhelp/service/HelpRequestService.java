package com.brainhive.modules.peerhelp.service;

import com.brainhive.modules.peerhelp.dto.*;
import com.brainhive.modules.peerhelp.model.*;
import com.brainhive.modules.peerhelp.repository.*;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HelpRequestService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private TutorSessionRepository tutorSessionRepository;

    private static final int MAX_PENDING_REQUESTS = 5;

    /**
     * Create a new help request.
     */
    public HelpRequestResponseDTO createHelpRequest(Long studentId, CreateHelpRequestDTO dto) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + studentId));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Only students can create help requests");
        }

        // Check if student has too many pending requests
        Long pendingCount = helpRequestRepository.countByStudentAndStatusIn(
                studentId, 
                Arrays.asList(HelpRequestStatus.PENDING, HelpRequestStatus.APPROVED)
        );
        if (pendingCount >= MAX_PENDING_REQUESTS) {
            throw new IllegalArgumentException("You have reached the maximum number of pending requests (" + MAX_PENDING_REQUESTS + ")");
        }

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + dto.getSubjectId()));

        HelpRequest request = new HelpRequest();
        request.setStudent(student);
        request.setSubject(subject);
        request.setTopic(dto.getTopic());
        request.setDescription(dto.getDescription());
        request.setStatus(HelpRequestStatus.PENDING);
        request.setUrgencyLevel(dto.getUrgencyLevel() != null ? dto.getUrgencyLevel() : 3);
        request.setPreferredDateTime(dto.getPreferredDateTime());
        request.setEstimatedDuration(dto.getEstimatedDuration() != null ? dto.getEstimatedDuration() : 60);

        HelpRequest saved = helpRequestRepository.save(request);
        return HelpRequestResponseDTO.fromEntity(saved);
    }

    /**
     * Get all help requests for a student.
     */
    public List<HelpRequestResponseDTO> getStudentRequests(Long studentId) {
        return helpRequestRepository.findByStudentId(studentId)
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all help requests assigned to a tutor.
     */
    public List<HelpRequestResponseDTO> getTutorAssignedRequests(Long tutorId) {
        return helpRequestRepository.findByAssignedTutorId(tutorId)
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get available pending requests for a tutor based on their subject expertise.
     */
    public List<HelpRequestResponseDTO> getAvailableRequestsForTutor(Long tutorId) {
        TutorProfile profile = tutorProfileRepository.findByTutorId(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found. Please create a profile first."));

        return helpRequestRepository.findPendingRequestsBySubjectOrderByPriority(
                        profile.getSubject().getId(), 
                        HelpRequestStatus.PENDING
                )
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending requests.
     */
    public List<HelpRequestResponseDTO> getAllPendingRequests() {
        return helpRequestRepository.findAllPendingOrderByPriority()
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get help request by ID.
     */
    public HelpRequestResponseDTO getRequestById(Long requestId) {
        HelpRequest request = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found with ID: " + requestId));
        return HelpRequestResponseDTO.fromEntity(request);
    }

    /**
     * Approve a help request and create a session.
     */
    public TutorSessionResponseDTO approveRequest(Long requestId, Long tutorId, ApproveRequestDTO dto) {
        HelpRequest request = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found with ID: " + requestId));

        if (request.getStatus() != HelpRequestStatus.PENDING) {
            throw new IllegalArgumentException("Request is not in PENDING status");
        }

        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + tutorId));

        if (tutor.getRole() != UserRole.TUTOR) {
            throw new IllegalArgumentException("Only tutors can approve help requests");
        }

        // Validate time range
        if (dto.getScheduledEndTime().isBefore(dto.getScheduledStartTime()) || 
            dto.getScheduledEndTime().equals(dto.getScheduledStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Update request status
        request.setStatus(HelpRequestStatus.APPROVED);
        request.setAssignedTutor(tutor);
        helpRequestRepository.save(request);

        // Create session
        TutorSession session = new TutorSession();
        session.setHelpRequest(request);
        session.setStudent(request.getStudent());
        session.setTutor(tutor);
        session.setScheduledStartTime(dto.getScheduledStartTime());
        session.setScheduledEndTime(dto.getScheduledEndTime());
        session.setMeetingLink(dto.getMeetingLink());
        session.setNotes(dto.getNotes());
        session.setIsCompleted(false);

        TutorSession savedSession = tutorSessionRepository.save(session);
        return TutorSessionResponseDTO.fromEntity(savedSession);
    }

    /**
     * Cancel a help request.
     */
    public HelpRequestResponseDTO cancelRequest(Long requestId, Long userId) {
        HelpRequest request = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found with ID: " + requestId));

        // Only the student who created the request can cancel it
        if (!request.getStudent().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to cancel this request");
        }

        if (request.getStatus() == HelpRequestStatus.COMPLETED || request.getStatus() == HelpRequestStatus.RATED) {
            throw new IllegalArgumentException("Cannot cancel a completed or rated request");
        }

        request.setStatus(HelpRequestStatus.CANCELLED);
        HelpRequest saved = helpRequestRepository.save(request);
        return HelpRequestResponseDTO.fromEntity(saved);
    }

    /**
     * Get matching tutors for a help request.
     */
    public List<TutorProfileResponseDTO> getMatchingTutors(Long requestId) {
        HelpRequest request = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found with ID: " + requestId));

        return tutorProfileRepository.findAvailableTutorsBySubjectOrderByCredibility(request.getSubject().getId())
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
