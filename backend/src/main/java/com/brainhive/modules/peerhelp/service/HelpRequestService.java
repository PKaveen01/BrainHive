package com.brainhive.modules.peerhelp.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.ApproveRequestDTO;
import com.brainhive.modules.peerhelp.dto.CreateHelpRequestDTO;
import com.brainhive.modules.peerhelp.dto.HelpRequestResponseDTO;
import com.brainhive.modules.peerhelp.dto.TutorProfileResponseDTO;
import com.brainhive.modules.peerhelp.dto.TutorSessionResponseDTO;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.SubjectRepository;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.repository.UserRepository;

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

        // Check if at least one approved tutor exists for this subject
        List<TutorProfile> availableTutors = tutorProfileRepository
                .findAvailableTutorsBySubjectOrderByCredibility(dto.getSubjectId());
        if (availableTutors.isEmpty()) {
            throw new IllegalArgumentException(
                "No approved tutors are currently available for this subject. Please try a different subject.");
        }

        // Validate preferred tutor if provided
        User preferredTutor = null;
        if (dto.getPreferredTutorId() != null) {
            preferredTutor = userRepository.findById(dto.getPreferredTutorId())
                    .orElseThrow(() -> new IllegalArgumentException("Preferred tutor not found."));
            if (preferredTutor.getRole() != UserRole.TUTOR) {
                throw new IllegalArgumentException("Selected preferred tutor is not a valid tutor.");
            }
        }

        HelpRequest request = new HelpRequest();
        request.setStudent(student);
        request.setSubject(subject);
        request.setTopic(dto.getTopic());
        request.setDescription(dto.getDescription());
        request.setStatus(HelpRequestStatus.PENDING);
        Integer urgency = dto.getUrgencyLevel();
        request.setUrgencyLevel(urgency == null ? 3 : urgency);
        request.setPreferredDateTime(dto.getPreferredDateTime());
        Integer duration = dto.getEstimatedDuration();
        request.setEstimatedDuration(duration == null ? 60 : duration);
        if (preferredTutor != null) {
            request.setAssignedTutor(preferredTutor);
        }

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
     * Lecture-scoped help threads (student–tutor chat about a specific lecture).
     */
    public List<HelpRequestResponseDTO> getLectureConversationsForTutor(Long tutorId) {
        return helpRequestRepository.findLectureThreadsForTutor(tutorId)
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Conversation-capable requests for tutors (accepted and post-session states).
     */
    public List<HelpRequestResponseDTO> getTutorConversations(Long tutorId) {
        return helpRequestRepository.findTutorConversationsByStatuses(
                        tutorId,
                        Arrays.asList(HelpRequestStatus.APPROVED, HelpRequestStatus.COMPLETED, HelpRequestStatus.RATED))
                .stream()
                .map(HelpRequestResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get available pending requests for a tutor based on their subject expertise.
     */
    public List<HelpRequestResponseDTO> getAvailableRequestsForTutor(Long tutorId) {
        return tutorProfileRepository.findByTutorId(tutorId)
            .map(profile -> helpRequestRepository.findPendingRequestsForTutor(
                profile.getSubject().getId(),
                tutorId,
                HelpRequestStatus.PENDING
            ))
            .orElseGet(() -> helpRequestRepository.findPendingAssignedRequestsForTutor(
                tutorId,
                HelpRequestStatus.PENDING
            ))
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

        if (request.getAssignedTutor() != null && !request.getAssignedTutor().getId().equals(tutorId)) {
            throw new IllegalArgumentException("You are not authorized to approve this request");
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
