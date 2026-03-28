package com.brainhive.modules.peerhelp.controller;

import com.brainhive.modules.peerhelp.dto.*;
import com.brainhive.modules.peerhelp.service.TutorAvailabilityService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/peerhelp/availability")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorAvailabilityController {

    @Autowired
    private TutorAvailabilityService availabilityService;

    @Autowired
    private UserService userService;

    /**
     * Add availability slot.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TutorAvailabilityResponseDTO>> addAvailability(
            @Valid @RequestBody TutorAvailabilityDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorAvailabilityResponseDTO availability = availabilityService.addAvailability(currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Availability added successfully", availability));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get my availability slots.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<TutorAvailabilityResponseDTO>>> getMyAvailability(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            List<TutorAvailabilityResponseDTO> availabilities = availabilityService.getTutorAvailability(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve availability"));
        }
    }

    /**
     * Get tutor availability by tutor ID.
     */
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<ApiResponse<List<TutorAvailabilityResponseDTO>>> getTutorAvailability(
            @PathVariable Long tutorId) {
        List<TutorAvailabilityResponseDTO> availabilities = availabilityService.getTutorAvailability(tutorId);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
    }

    /**
     * Get availability for a specific day.
     */
    @GetMapping("/me/day/{dayOfWeek}")
    public ResponseEntity<ApiResponse<List<TutorAvailabilityResponseDTO>>> getAvailabilityByDay(
            @PathVariable String dayOfWeek,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            DayOfWeek day = DayOfWeek.valueOf(dayOfWeek.toUpperCase());
            List<TutorAvailabilityResponseDTO> availabilities = 
                    availabilityService.getAvailabilityByDay(currentUser.getId(), day);
            return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", availabilities));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid day of week: " + dayOfWeek));
        }
    }

    /**
     * Update an availability slot.
     */
    @PutMapping("/{availabilityId}")
    public ResponseEntity<ApiResponse<TutorAvailabilityResponseDTO>> updateAvailability(
            @PathVariable Long availabilityId,
            @Valid @RequestBody TutorAvailabilityDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorAvailabilityResponseDTO availability = availabilityService.updateAvailability(availabilityId, dto);
            return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", availability));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete an availability slot.
     */
    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(
            @PathVariable Long availabilityId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            availabilityService.deleteAvailability(availabilityId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", null));
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
     * Deactivate an availability slot.
     */
    @PatchMapping("/{availabilityId}/deactivate")
    public ResponseEntity<ApiResponse<TutorAvailabilityResponseDTO>> deactivateAvailability(
            @PathVariable Long availabilityId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorAvailabilityResponseDTO availability = 
                    availabilityService.deactivateAvailability(availabilityId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Availability deactivated successfully", availability));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
