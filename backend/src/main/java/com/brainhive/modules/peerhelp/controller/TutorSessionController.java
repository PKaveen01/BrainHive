package com.brainhive.modules.peerhelp.controller;

import com.brainhive.modules.peerhelp.dto.*;
import com.brainhive.modules.peerhelp.service.TutorSessionService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peerhelp/sessions")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorSessionController {

    @Autowired
    private TutorSessionService sessionService;

    @Autowired
    private UserService userService;

    /**
     * Get session by ID.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> getSessionById(
            @PathVariable Long sessionId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorSessionResponseDTO sessionResponse = sessionService.getSessionById(sessionId);
            return ResponseEntity.ok(ApiResponse.success("Session retrieved successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get my sessions (based on role).
     */
    @GetMapping("/my-sessions")
    public ResponseEntity<ApiResponse<List<TutorSessionResponseDTO>>> getMySessions(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            List<TutorSessionResponseDTO> sessions;
            if (currentUser.getRole() == UserRole.STUDENT) {
                sessions = sessionService.getStudentSessions(currentUser.getId());
            } else {
                sessions = sessionService.getTutorSessions(currentUser.getId());
            }
            return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", sessions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve sessions"));
        }
    }

    /**
     * Get upcoming sessions.
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<TutorSessionResponseDTO>>> getUpcomingSessions(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            List<TutorSessionResponseDTO> sessions;
            if (currentUser.getRole() == UserRole.STUDENT) {
                sessions = sessionService.getUpcomingStudentSessions(currentUser.getId());
            } else {
                sessions = sessionService.getUpcomingTutorSessions(currentUser.getId());
            }
            return ResponseEntity.ok(ApiResponse.success("Upcoming sessions retrieved successfully", sessions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve sessions"));
        }
    }

    /**
     * Start a session (Tutor only).
     */
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> startSession(
            @PathVariable Long sessionId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can start sessions"));
            }

            TutorSessionResponseDTO sessionResponse = sessionService.startSession(sessionId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Session started successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("Only")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Complete a session (Tutor only).
     */
    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> completeSession(
            @PathVariable Long sessionId,
            @RequestBody(required = false) CompleteSessionRequest request,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can complete sessions"));
            }

            String notes = request != null ? request.getNotes() : null;
            TutorSessionResponseDTO sessionResponse = sessionService.completeSession(
                    sessionId, currentUser.getId(), notes);
            return ResponseEntity.ok(ApiResponse.success("Session completed successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("Only")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update session notes.
     */
    @PatchMapping("/{sessionId}/notes")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> updateNotes(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateNotesRequest request,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorSessionResponseDTO sessionResponse = sessionService.updateNotes(
                    sessionId, currentUser.getId(), request.getNotes());
            return ResponseEntity.ok(ApiResponse.success("Notes updated successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update meeting link (Tutor only).
     */
    @PatchMapping("/{sessionId}/meeting-link")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> updateMeetingLink(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateMeetingLinkRequest request,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can update meeting links"));
            }

            TutorSessionResponseDTO sessionResponse = sessionService.updateMeetingLink(
                    sessionId, currentUser.getId(), request.getMeetingLink());
            return ResponseEntity.ok(ApiResponse.success("Meeting link updated successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get session by request ID.
     */
    @GetMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<TutorSessionResponseDTO>> getSessionByRequestId(
            @PathVariable Long requestId) {
        try {
            TutorSessionResponseDTO sessionResponse = sessionService.getSessionByRequestId(requestId);
            return ResponseEntity.ok(ApiResponse.success("Session retrieved successfully", sessionResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Request body for completing session.
     */
    public static class CompleteSessionRequest {
        @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
        private String notes;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Request body for updating notes.
     */
    public static class UpdateNotesRequest {
        @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
        private String notes;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Request body for updating meeting link.
     */
    public static class UpdateMeetingLinkRequest {
        @Size(max = 500, message = "Meeting link cannot exceed 500 characters")
        private String meetingLink;

        public String getMeetingLink() { return meetingLink; }
        public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    }
}
