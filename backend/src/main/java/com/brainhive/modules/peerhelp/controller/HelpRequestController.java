package com.brainhive.modules.peerhelp.controller;

import com.brainhive.modules.peerhelp.dto.*;
import com.brainhive.modules.peerhelp.service.HelpRequestService;
import com.brainhive.modules.peerhelp.service.TutorMatchingService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/peerhelp/requests")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HelpRequestController {

    @Autowired
    private HelpRequestService helpRequestService;

    @Autowired
    private TutorMatchingService tutorMatchingService;

    @Autowired
    private UserService userService;

    /**
     * Create a new help request (Student only).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HelpRequestResponseDTO>> createHelpRequest(
            @Valid @RequestBody CreateHelpRequestDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can create help requests"));
            }

            HelpRequestResponseDTO request = helpRequestService.createHelpRequest(currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Help request created successfully", request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get my help requests (Student).
     */
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<HelpRequestResponseDTO>>> getMyRequests(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            List<HelpRequestResponseDTO> requests = helpRequestService.getStudentRequests(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve requests"));
        }
    }

    /**
     * Get requests assigned to me (Tutor).
     */
    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<HelpRequestResponseDTO>>> getAssignedRequests(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can view assigned requests"));
            }

            List<HelpRequestResponseDTO> requests = helpRequestService.getTutorAssignedRequests(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Assigned requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve requests"));
        }
    }

    /**
     * Get available requests for tutor based on their subject.
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<HelpRequestResponseDTO>>> getAvailableRequests(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can view available requests"));
            }

            List<HelpRequestResponseDTO> requests = helpRequestService.getAvailableRequestsForTutor(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Available requests retrieved successfully", requests));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all pending requests.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<HelpRequestResponseDTO>>> getAllPendingRequests() {
        List<HelpRequestResponseDTO> requests = helpRequestService.getAllPendingRequests();
        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved successfully", requests));
    }

    /**
     * Get request by ID.
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<HelpRequestResponseDTO>> getRequestById(@PathVariable Long requestId) {
        try {
            HelpRequestResponseDTO request = helpRequestService.getRequestById(requestId);
            return ResponseEntity.ok(ApiResponse.success("Request retrieved successfully", request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve a help request (Tutor only).
     */
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> approveRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ApproveRequestDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can approve help requests"));
            }

            TutorSessionResponseDTO sessionResponse = helpRequestService.approveRequest(
                    requestId, currentUser.getId(), dto);
            return ResponseEntity.ok(ApiResponse.success("Request approved successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cancel a help request (Student only).
     */
    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<HelpRequestResponseDTO>> cancelRequest(
            @PathVariable Long requestId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            HelpRequestResponseDTO request = helpRequestService.cancelRequest(requestId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Request cancelled successfully", request));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get matching tutors for a request.
     */
    @GetMapping("/{requestId}/matching-tutors")
    public ResponseEntity<ApiResponse<List<TutorProfileResponseDTO>>> getMatchingTutors(
            @PathVariable Long requestId) {
        try {
            List<TutorProfileResponseDTO> tutors = helpRequestService.getMatchingTutors(requestId);
            return ResponseEntity.ok(ApiResponse.success("Matching tutors retrieved successfully", tutors));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get top matching tutors for a subject.
     */
    @GetMapping("/match/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<TutorProfileResponseDTO>>> getTopMatches(
            @PathVariable Long subjectId,
            @RequestParam(required = false) LocalDateTime preferredDateTime,
            @RequestParam(defaultValue = "5") int limit) {
        List<TutorProfileResponseDTO> tutors = tutorMatchingService.getTopMatches(subjectId, preferredDateTime, limit);
        return ResponseEntity.ok(ApiResponse.success("Top matches retrieved successfully", tutors));
    }

    /**
     * Get best matching tutor for a subject.
     */
    @GetMapping("/match/best/{subjectId}")
    public ResponseEntity<ApiResponse<TutorProfileResponseDTO>> getBestMatch(
            @PathVariable Long subjectId,
            @RequestParam(required = false) LocalDateTime preferredDateTime) {
        TutorProfileResponseDTO tutor = tutorMatchingService.getBestMatch(subjectId, preferredDateTime);
        if (tutor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No matching tutor found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Best match retrieved successfully", tutor));
    }
}
