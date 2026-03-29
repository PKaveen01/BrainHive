package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.CreateUserReviewDTO;
import com.brainhive.modules.peerhelp.dto.UserReviewResponseDTO;
import com.brainhive.modules.peerhelp.model.UserReview;
import com.brainhive.modules.peerhelp.repository.UserReviewRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.repository.UserRepository;

@Service
@Transactional
public class UserReviewService {

    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;

    public UserReviewService(UserReviewRepository userReviewRepository, UserRepository userRepository) {
        this.userReviewRepository = userReviewRepository;
        this.userRepository = userRepository;
    }

    public UserReviewResponseDTO createReview(Long userId, CreateUserReviewDTO dto) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        UserReview review = new UserReview();
        review.setReviewer(reviewer);
        review.setRating(dto.getRating());
        review.setTitle(dto.getTitle().trim());
        review.setReviewText(dto.getReviewText().trim());
        review.setIsVisible(Boolean.TRUE);

        UserReview saved = userReviewRepository.save(review);
        return UserReviewResponseDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<UserReviewResponseDTO> getPublicReviews(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 30));
        return userReviewRepository.findByIsVisibleTrue(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(UserReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
