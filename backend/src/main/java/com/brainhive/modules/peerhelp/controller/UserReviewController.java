package com.brainhive.modules.peerhelp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.brainhive.modules.peerhelp.dto.ApiResponse;
import com.brainhive.modules.peerhelp.dto.CreateUserReviewDTO;
import com.brainhive.modules.peerhelp.dto.UserReviewResponseDTO;
import com.brainhive.modules.peerhelp.service.UserReviewService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/peerhelp/reviews")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserReviewController {

    private final UserReviewService userReviewService;
    private final UserService userService;

    public UserReviewController(UserReviewService userReviewService, UserService userService) {
        this.userReviewService = userReviewService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserReviewResponseDTO>> createReview(
            @Valid @RequestBody CreateUserReviewDTO dto,
            HttpSession session) {
        User currentUser = userService.getCurrentUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Please login first to add a review"));
        }

        UserReviewResponseDTO created = userReviewService.createReview(currentUser.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review added successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserReviewResponseDTO>>> getReviews(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserReviewResponseDTO> reviews = userReviewService.getPublicReviews(limit);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<UserReviewResponseDTO>>> getPublicReviews(
            @RequestParam(defaultValue = "10") int limit) {
        return getReviews(limit);
    }
}
