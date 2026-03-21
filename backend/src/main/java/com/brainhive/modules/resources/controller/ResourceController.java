package com.brainhive.modules.resources.controller;

import com.brainhive.modules.resources.dto.ResourceDTO;
import com.brainhive.modules.resources.dto.ReportRequestDTO;
import com.brainhive.modules.resources.dto.RatingRequestDTO;
import com.brainhive.modules.resources.model.Resource;
import com.brainhive.modules.resources.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/upload/file")
    public ResponseEntity<?> uploadFileResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subject") String subject,
            @RequestParam("semester") String semester,
            @RequestParam("type") String type,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "visibility", required = false) String visibility,
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam(value = "license", required = false) String license,
            @RequestParam(value = "allowRatings", required = false) Boolean allowRatings,
            @RequestParam(value = "allowComments", required = false) Boolean allowComments,
            @RequestParam("userId") String userId) {  // ✅ Changed from Long to String

        try {
            ResourceDTO resourceDTO = new ResourceDTO();
            resourceDTO.setTitle(title);
            resourceDTO.setDescription(description);
            resourceDTO.setSubject(subject);
            resourceDTO.setSemester(semester);
            resourceDTO.setType(type);
            resourceDTO.setTags(tags);
            resourceDTO.setVisibility(visibility);
            resourceDTO.setCourseCode(courseCode);
            resourceDTO.setLicense(license);
            resourceDTO.setAllowRatings(allowRatings);
            resourceDTO.setAllowComments(allowComments);
            resourceDTO.setUserId(userId);  // ✅ Now setting String

            Resource resource = resourceService.uploadFileResource(file, resourceDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("resource", resource);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/upload/link")
    public ResponseEntity<?> uploadLinkResource(@RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resource = resourceService.uploadLinkResource(resourceDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Link added successfully");
            response.put("resource", resource);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Resource>> searchResources(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String type,
            @PageableDefault(size = 20, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<Resource> resources = resourceService.searchResources(query, subject, semester, type, pageable);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        try {
            Resource resource = resourceService.getResourceById(id);
            resourceService.incrementViewCount(id);
            return ResponseEntity.ok(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resource>> getUserResources(@PathVariable String userId) {  // ✅ Changed from Long to String
        List<Resource> resources = resourceService.getUserResources(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Resource>> getRecentUserUploads(@PathVariable String userId) {  // ✅ Changed from Long to String
        List<Resource> resources = resourceService.getRecentUserUploads(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/user/{userId}/bookmarked")
    public ResponseEntity<List<Resource>> getUserBookmarkedResources(@PathVariable String userId) {  // ✅ Changed from Long to String
        List<Resource> resources = resourceService.getUserBookmarkedResources(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{resourceId}/bookmarked/status")
    public ResponseEntity<Map<String, Boolean>> checkBookmarkStatus(
            @PathVariable Long resourceId,
            @RequestParam String userId) {  // ✅ Changed from Long to String
        boolean isBookmarked = resourceService.isResourceBookmarked(resourceId, userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isBookmarked", isBookmarked);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resource = resourceService.updateResource(id, resourceDTO);
            return ResponseEntity.ok(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{resourceId}/bookmark")
    public ResponseEntity<?> bookmarkResource(
            @PathVariable Long resourceId,
            @RequestParam String userId) {  // ✅ Changed from Long to String
        try {
            resourceService.bookmarkResource(resourceId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource bookmarked successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{resourceId}/bookmark")
    public ResponseEntity<?> removeBookmark(
            @PathVariable Long resourceId,
            @RequestParam String userId) {  // ✅ Changed from Long to String
        try {
            resourceService.removeBookmark(resourceId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Bookmark removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{resourceId}/rate")
    public ResponseEntity<?> rateResource(
            @PathVariable Long resourceId,
            @RequestParam String userId,  // ✅ Changed from Long to String
            @RequestBody RatingRequestDTO ratingRequest) {
        try {
            Resource resource = resourceService.rateResource(
                    resourceId,
                    userId,
                    ratingRequest.getRating(),
                    ratingRequest.getReview()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rating submitted successfully");
            response.put("averageRating", resource.getAverageRating());
            response.put("ratingCount", resource.getRatingCount());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{resourceId}/rating/average")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long resourceId) {
        try {
            Double averageRating = resourceService.getResourceAverageRating(resourceId);
            Resource resource = resourceService.getResourceById(resourceId);

            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", averageRating != null ? averageRating : 0.0);
            response.put("ratingCount", resource.getRatingCount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{resourceId}/report")
    public ResponseEntity<?> reportResource(
            @PathVariable Long resourceId,
            @RequestParam String userId,  // ✅ Changed from Long to String
            @RequestBody ReportRequestDTO reportRequest) {
        try {
            resourceService.reportResource(resourceId, userId, reportRequest);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource reported successfully. Moderators will review it.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{resourceId}/moderate")
    public ResponseEntity<?> moderateResource(
            @PathVariable Long resourceId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        try {
            Resource resource = resourceService.moderateResource(resourceId, status, notes);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource moderated successfully");
            response.put("status", resource.getStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{resourceId}/view")
    public ResponseEntity<?> incrementViewCount(@PathVariable Long resourceId) {
        try {
            resourceService.incrementViewCount(resourceId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{resourceId}/download")
    public ResponseEntity<?> incrementDownloadCount(@PathVariable Long resourceId) {
        try {
            resourceService.incrementDownloadCount(resourceId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Download count incremented");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/recommended/{userId}")
    public ResponseEntity<List<Resource>> getRecommendedResources(@PathVariable String userId) {  // ✅ Changed from Long to String
        try {
            List<Resource> resources = resourceService.getRecommendedResources(userId);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}