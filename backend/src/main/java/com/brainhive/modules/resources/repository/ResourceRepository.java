package com.brainhive.modules.resources.repository;

import com.brainhive.modules.resources.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByUploadedById(Long userId);

    List<Resource> findByStatus(String status);

    Page<Resource> findByStatus(String status, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE " +
            "(:subject IS NULL OR r.subject = :subject) AND " +
            "(:semester IS NULL OR r.semester = :semester) AND " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:query IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(r.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Resource> searchResources(@Param("query") String query,
                                   @Param("subject") String subject,
                                   @Param("semester") String semester,
                                   @Param("type") String type,
                                   Pageable pageable);

    @Query("SELECT r FROM Resource r JOIN r.bookmarkedBy u WHERE u.id = :userId")
    List<Resource> findBookmarkedByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Resource r WHERE r.uploadedBy.id = :userId ORDER BY r.uploadedAt DESC")
    List<Resource> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.subject = :subject")
    Page<Resource> findBySubject(@Param("subject") String subject, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.semester = :semester")
    Page<Resource> findBySemester(@Param("semester") String semester, Pageable pageable);
}