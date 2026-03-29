package com.brainhive.modules.peerhelp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brainhive.modules.peerhelp.dto.ApiResponse;
import com.brainhive.modules.peerhelp.dto.CreateRatingDTO;
import com.brainhive.modules.peerhelp.dto.RatingResponseDTO;
import com.brainhive.modules.peerhelp.service.RatingService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/peerhelp/ratings")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private UserService userService;

    /**
     * Create a rating for a completed session (Student only).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponseDTO>> createRating(
            @Valid @RequestBody CreateRatingDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can rate sessions"));
            }

            RatingResponseDTO rating = ratingService.createRating(currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Rating submitted successfully", rating));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("only rate")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get rating by session ID.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<RatingResponseDTO>> getRatingBySessionId(
            @PathVariable Long sessionId) {
        try {
            RatingResponseDTO rating = ratingService.getRatingBySessionId(sessionId);
            return ResponseEntity.ok(ApiResponse.success("Rating retrieved successfully", rating));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all ratings for a tutor.
     */
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<ApiResponse<List<RatingResponseDTO>>> getTutorRatings(
            @PathVariable Long tutorId) {
        List<RatingResponseDTO> ratings = ratingService.getTutorRatings(tutorId);
        return ResponseEntity.ok(ApiResponse.success("Ratings retrieved successfully", ratings));
    }

    /**
     * Get all ratings given by a student.
     */
    @GetMapping("/my-ratings")
    public ResponseEntity<ApiResponse<List<RatingResponseDTO>>> getMyRatings(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            List<RatingResponseDTO> ratings = ratingService.getStudentGivenRatings(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Your ratings retrieved successfully", ratings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve ratings"));
        }
    }

    /**
     * Update my own rating (Student only).
     */
    @PutMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponseDTO>> updateRating(
            @PathVariable Long ratingId,
            @Valid @RequestBody CreateRatingDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can update ratings"));
            }

            RatingResponseDTO updated = ratingService.updateRating(currentUser.getId(), ratingId, dto);
            return ResponseEntity.ok(ApiResponse.success("Rating updated successfully", updated));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("only") || e.getMessage().contains("cannot be changed")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete my own rating (Student only).
     */
    @DeleteMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @PathVariable Long ratingId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can delete ratings"));
            }

            ratingService.deleteRating(currentUser.getId(), ratingId);
            return ResponseEntity.ok(ApiResponse.success("Rating deleted successfully", null));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("only")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get average rating for a tutor.
     */
    @GetMapping("/tutor/{tutorId}/average")
    public ResponseEntity<ApiResponse<Double>> getTutorAverageRating(@PathVariable Long tutorId) {
        Double average = ratingService.getTutorAverageRating(tutorId);
        return ResponseEntity.ok(ApiResponse.success("Average rating retrieved successfully", average));
    }

    /**
     * Get rating count for a tutor.
     */
    @GetMapping("/tutor/{tutorId}/count")
    public ResponseEntity<ApiResponse<Long>> getTutorRatingCount(@PathVariable Long tutorId) {
        Long count = ratingService.getTutorRatingCount(tutorId);
        return ResponseEntity.ok(ApiResponse.success("Rating count retrieved successfully", count));
    }

    /**
     * Get detailed rating breakdown for a tutor.
     */
    @GetMapping("/tutor/{tutorId}/breakdown")
    public ResponseEntity<ApiResponse<RatingService.TutorRatingBreakdown>> getTutorRatingBreakdown(
            @PathVariable Long tutorId) {
        RatingService.TutorRatingBreakdown breakdown = ratingService.getTutorRatingBreakdown(tutorId);
        return ResponseEntity.ok(ApiResponse.success("Rating breakdown retrieved successfully", breakdown));
    }

    /**
     * Get my received ratings (Tutor).
     */
    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<RatingResponseDTO>>> getReceivedRatings(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can view received ratings"));
            }

            List<RatingResponseDTO> ratings = ratingService.getTutorRatings(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Received ratings retrieved successfully", ratings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve ratings"));
        }
    }

    /**
     * Get my rating breakdown (Tutor).
     */
    @GetMapping("/my-breakdown")
    public ResponseEntity<ApiResponse<RatingService.TutorRatingBreakdown>> getMyRatingBreakdown(
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can view their rating breakdown"));
            }

            RatingService.TutorRatingBreakdown breakdown = ratingService.getTutorRatingBreakdown(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Your rating breakdown retrieved successfully", breakdown));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve rating breakdown"));
        }
    }
}
