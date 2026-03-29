package com.brainhive.modules.peerhelp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.UserReview;

@Repository
public interface UserReviewRepository extends JpaRepository<UserReview, Long> {

    Page<UserReview> findByIsVisibleTrue(Pageable pageable);
}
