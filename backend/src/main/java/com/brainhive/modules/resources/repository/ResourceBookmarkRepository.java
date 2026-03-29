package com.brainhive.modules.resources.repository;

import com.brainhive.modules.resources.model.ResourceBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceBookmarkRepository extends JpaRepository<ResourceBookmark, Long> {

    boolean existsByResourceIdAndUserId(Long resourceId, Long userId);

    void deleteByResourceIdAndUserId(Long resourceId, Long userId);

    long countByResourceId(Long resourceId);
}