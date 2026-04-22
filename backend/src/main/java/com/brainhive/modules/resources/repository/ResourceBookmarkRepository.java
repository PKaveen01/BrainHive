package com.brainhive.modules.resources.repository;

import com.brainhive.modules.resources.model.ResourceBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ResourceBookmarkRepository extends JpaRepository<ResourceBookmark, Long> {

    @Query("SELECT COUNT(b) > 0 FROM ResourceBookmark b WHERE b.resource.id = :resourceId AND b.user.id = :userId")
    boolean existsByResourceIdAndUserId(@Param("resourceId") Long resourceId, @Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ResourceBookmark b WHERE b.resource.id = :resourceId AND b.user.id = :userId")
    void deleteByResourceIdAndUserId(@Param("resourceId") Long resourceId, @Param("userId") Long userId);

    @Query("SELECT COUNT(b) FROM ResourceBookmark b WHERE b.resource.id = :resourceId")
    long countByResourceId(@Param("resourceId") Long resourceId);

    @Query("SELECT COUNT(b) FROM ResourceBookmark b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM ResourceBookmark b WHERE b.user.id = :userId")
    List<ResourceBookmark> findByUserId(@Param("userId") Long userId);
}
