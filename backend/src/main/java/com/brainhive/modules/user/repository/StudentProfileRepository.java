package com.brainhive.modules.user.repository;

import com.brainhive.modules.user.model.StudentProfile;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);

    // Eagerly fetch weakSubjects and subjects in one query to avoid LazyInitializationException
    @Query("SELECT sp FROM StudentProfile sp " +
           "LEFT JOIN FETCH sp.weakSubjects " +
           "LEFT JOIN FETCH sp.subjects " +
           "WHERE sp.user.id = :userId")
    Optional<StudentProfile> findByUserIdWithCollections(@Param("userId") Long userId);
}
