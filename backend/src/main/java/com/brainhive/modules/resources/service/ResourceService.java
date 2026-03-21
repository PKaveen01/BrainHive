package com.brainhive.modules.resources.service;

import com.brainhive.modules.resources.dto.ResourceDTO;
import com.brainhive.modules.resources.dto.ReportRequestDTO;
import com.brainhive.modules.resources.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ResourceService {

    // Upload operations
    Resource uploadFileResource(MultipartFile file, ResourceDTO resourceDTO) throws IOException;
    Resource uploadLinkResource(ResourceDTO resourceDTO);

    // Search and retrieval
    Page<Resource> searchResources(String query, String subject, String semester, String type, Pageable pageable);
    Resource getResourceById(Long id);
    List<Resource> getUserResources(String userId);                    // ✅ Changed from Long to String
    List<Resource> getRecentUserUploads(String userId);                // ✅ Changed from Long to String
    List<Resource> getUserBookmarkedResources(String userId);          // ✅ Changed from Long to String

    // Update/Delete
    Resource updateResource(Long id, ResourceDTO resourceDTO);
    void deleteResource(Long id);

    // Bookmark operations
    Resource bookmarkResource(Long resourceId, String userId);         // ✅ Changed from Long to String
    Resource removeBookmark(Long resourceId, String userId);           // ✅ Changed from Long to String
    boolean isResourceBookmarked(Long resourceId, String userId);      // ✅ Changed from Long to String

    // Rating operations
    Resource rateResource(Long resourceId, String userId, Integer rating, String review);  // ✅ Changed from Long to String
    Double getResourceAverageRating(Long resourceId);

    // Report operations
    Resource reportResource(Long resourceId, String userId, ReportRequestDTO reportRequest);  // ✅ Changed from Long to String

    // Moderation
    Resource moderateResource(Long resourceId, String status, String notes);

    // Stats
    void incrementViewCount(Long resourceId);
    void incrementDownloadCount(Long resourceId);

    // Recommendations
    List<Resource> getRecommendedResources(String userId);             // ✅ Changed from Long to String
}