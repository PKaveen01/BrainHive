package com.brainhive.modules.user.repository;

import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRole(String email, UserRole role);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndAccountStatus(UserRole role, String accountStatus);
    long countByRole(UserRole role);
    long countByRoleAndAccountStatus(UserRole role, String accountStatus);
}
