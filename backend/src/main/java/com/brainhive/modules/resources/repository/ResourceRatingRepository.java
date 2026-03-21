package com.brainhive.modules.resources.repository;

import com.brainhive.modules.resources.model.ResourceRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRatingRepository extends JpaRepository<ResourceRating, Long> {

    ResourceRating findByResourceIdAndUserId(Long resourceId, Long userId);

    @Query("SELECT AVG(r.rating) FROM ResourceRating r WHERE r.resource.id = :resourceId")
    Double getAverageRatingForResource(@Param("resourceId") Long resourceId);

    @Query("SELECT COUNT(r) FROM ResourceRating r WHERE r.resource.id = :resourceId")
    Long countByResourceId(@Param("resourceId") Long resourceId);

    boolean existsByResourceIdAndUserId(Long resourceId, Long userId);

    void deleteByResourceIdAndUserId(Long resourceId, Long userId);
}