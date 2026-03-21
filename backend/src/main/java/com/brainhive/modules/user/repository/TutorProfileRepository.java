package com.brainhive.modules.user.repository;

import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {
    Optional<TutorProfile> findByUser(User user);
    Optional<TutorProfile> findByUserId(Long userId);
}