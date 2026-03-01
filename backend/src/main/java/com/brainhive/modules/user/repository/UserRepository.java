package com.brainhive.modules.user.repository;

import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRole(String email, UserRole role);
    boolean existsByEmail(String email);
}