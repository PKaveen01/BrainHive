package com.brainhive.modules.resources.controller;

import com.brainhive.modules.resources.dto.RatingRequestDTO;
import com.brainhive.modules.resources.dto.ReportRequestDTO;
import com.brainhive.modules.resources.dto.ResourceDTO;
import com.brainhive.modules.resources.model.Resource;
import com.brainhive.modules.resources.service.DiscoveryService;
import com.brainhive.modules.resources.service.ResourceService;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                   RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH},
        allowCredentials = "true"
)
public class ResourceController {

    @Autowired private ResourceService resourceService;
    @Autowired private UserService userService;
    @Autowired private DiscoveryService discoveryService;

    // ==================== DISCOVERY ====================

    /**
     * Personalised discovery feed.
     * Weak-area resources ranked first, then current subjects, then everything else.
     * Collections are loaded inside a proper @Transactional service to avoid LazyInitializationException.
     */
    @GetMapping("/discovery")
    public ResponseEntity<?> getDiscoveryResources(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String type,
            HttpSession session) {
        try {
            List<Resource> allActive = resourceService.searchResources(
                    query, subject, null, type,
                    PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "uploadedAt")))
                    .getContent();

            Long userId = (Long) session.getAttribute("userId");

            // Load personalization INSIDE a transaction (no lazy init problem)
            DiscoveryService.PersonalizationData pd = discoveryService.loadPersonalization(userId);
            Set<String> weakSubjects    = pd.weakSubjects;
            Set<String> currentSubjects = pd.currentSubjects;

            List<Resource> sorted = allActive.stream()
                .sorted(Comparator.comparingInt((Resource r) -> {
                    String rs = r.getSubject() == null ? "" : r.getSubject().toLowerCase();
                    for (String w : weakSubjects) {
                        if (rs.contains(w.toLowerCase()) || w.toLowerCase().contains(rs)) return -30;
                    }
                    for (String s : currentSubjects) {
                        if (rs.contains(s.toLowerCase()) || s.toLowerCase().contains(rs)) return -20;
                    }
                    return 0;
                }).thenComparing(
                    Comparator.comparing(Resource::getUploadedAt, Comparator.nullsLast(Comparator.reverseOrder()))))
                .collect(Collectors.toList());

            List<Map<String, Object>> result = sorted.stream().map(r -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id",             r.getId());
                m.put("title",          r.getTitle());
                m.put("description",    r.getDescription());
                m.put("subject",        r.getSubject());
                m.put("semester",       r.getSemester());
                m.put("type",           r.getType());
                m.put("tags",           r.getTags());
                m.put("link",           r.getLink());
                m.put("filePath",       r.getFilePath());
                m.put("fileName",       r.getFileName());
                m.put("fileSize",       r.getFileSize());
                m.put("status",         r.getStatus());
                m.put("averageRating",  r.getAverageRating());
                m.put("ratingCount",    r.getRatingCount());
                m.put("viewCount",      r.getViewCount());
                m.put("downloadCount",  r.getDownloadCount());
                m.put("uploadedAt",     r.getUploadedAt());
                if (r.getUploadedBy() != null) {
                    m.put("uploaderName",  r.getUploadedBy().getFullName());
                    m.put("uploadedById",  r.getUploadedBy().getId());
                }
                String rl = r.getSubject() == null ? "" : r.getSubject().toLowerCase();
                boolean isWeak    = weakSubjects.stream().anyMatch(w -> rl.contains(w.toLowerCase()) || w.toLowerCase().contains(rl));
                boolean isCurrent = !isWeak && currentSubjects.stream().anyMatch(s -> rl.contains(s.toLowerCase()) || s.toLowerCase().contains(rl));
                m.put("relevanceTag", isWeak ? "weak-area" : isCurrent ? "current-subject" : "general");
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching discovery resources: " + e.getMessage());
        }
    }

    // ==================== UPLOAD ====================

    @PostMapping(value = "/upload/file", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadFileResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description",  required = false) String description,
            @RequestParam(value = "subject",      required = false) String subject,
            @RequestParam(value = "semester",     required = false) String semester,
            @RequestParam(value = "type",         required = false) String type,
            @RequestParam(value = "tags",         required = false) String tags,
            @RequestParam(value = "visibility",   required = false) String visibility,
            @RequestParam(value = "courseCode",   required = false) String courseCode,
            @RequestParam(value = "license",      required = false) String license,
            @RequestParam(value = "allowRatings", required = false, defaultValue = "true")  Boolean allowRatings,
            @RequestParam(value = "allowComments",required = false, defaultValue = "true")  Boolean allowComments,
            @RequestParam("userId") String userId) {
        try {
            ResourceDTO dto = new ResourceDTO();
            dto.setTitle(title); dto.setDescription(description); dto.setSubject(subject);
            dto.setSemester(semester); dto.setType(type); dto.setTags(tags);
            dto.setVisibility(visibility); dto.setCourseCode(courseCode); dto.setLicense(license);
            dto.setAllowRatings(allowRatings); dto.setAllowComments(allowComments); dto.setUserId(userId);

            Resource resource = resourceService.uploadFileResource(file, dto);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("resource", resource);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/upload/link")
    public ResponseEntity<?> uploadLinkResource(@RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resource = resourceService.uploadLinkResource(resourceDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Link resource created successfully");
            response.put("resource", resource);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== SEARCH ====================

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

    @GetMapping("/{resourceId}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long resourceId) {
        try {
            Resource resource = resourceService.getResourceById(resourceId);
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== USER RESOURCES ====================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resource>> getUserResources(@PathVariable String userId) {
        List<Resource> resources = resourceService.getUserResources(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Resource>> getRecentUserUploads(@PathVariable String userId) {
        List<Resource> resources = resourceService.getRecentUserUploads(userId);
        return ResponseEntity.ok(resources);
    }

    // ==================== BOOKMARKS ====================

    /** Get all resources bookmarked by a user. Used by BookMarked page and Discovery page. */
    @GetMapping("/bookmarks/{userId}")
    public ResponseEntity<List<Resource>> getUserBookmarkedResourcesById(@PathVariable String userId) {
        List<Resource> resources = resourceService.getUserBookmarkedResources(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/user/{userId}/bookmarked")
    public ResponseEntity<List<Resource>> getUserBookmarkedResources(@PathVariable String userId) {
        List<Resource> resources = resourceService.getUserBookmarkedResources(userId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{resourceId}/bookmarked/status")
    public ResponseEntity<Map<String, Boolean>> checkBookmarkStatus(
            @PathVariable Long resourceId,
            @RequestParam String userId) {
        boolean isBookmarked = resourceService.isResourceBookmarked(resourceId, userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isBookmarked", isBookmarked);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{resourceId}/bookmark/{userId}")
    public ResponseEntity<?> bookmarkByPath(@PathVariable Long resourceId, @PathVariable String userId) {
        try {
            resourceService.bookmarkResource(resourceId, userId);
            return ResponseEntity.ok(Map.of("message", "Bookmarked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{resourceId}/bookmark")
    public ResponseEntity<?> bookmarkResource(
            @PathVariable Long resourceId,
            @RequestParam String userId) {
        try {
            resourceService.bookmarkResource(resourceId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource bookmarked successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{resourceId}/bookmark/{userId}")
    public ResponseEntity<?> removeBookmarkByPath(@PathVariable Long resourceId, @PathVariable String userId) {
        try {
            resourceService.removeBookmark(resourceId, userId);
            return ResponseEntity.ok(Map.of("message", "Bookmark removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{resourceId}/bookmark")
    public ResponseEntity<?> removeBookmark(
            @PathVariable Long resourceId,
            @RequestParam String userId) {
        try {
            resourceService.removeBookmark(resourceId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Bookmark removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== RATINGS ====================

    @PostMapping("/{resourceId}/rate")
    public ResponseEntity<?> rateResource(
            @PathVariable Long resourceId,
            @RequestBody RatingRequestDTO ratingRequest) {
        try {
            Resource resource = resourceService.rateResource(
                    resourceId, ratingRequest.getUserId(),
                    ratingRequest.getRating(), ratingRequest.getReview());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rating submitted successfully");
            response.put("averageRating", resource.getAverageRating());
            response.put("ratingCount", resource.getRatingCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{resourceId}/rating")
    public ResponseEntity<?> getResourceRating(@PathVariable Long resourceId) {
        try {
            Double avgRating = resourceService.getResourceAverageRating(resourceId);
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", avgRating != null ? avgRating : 0.0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== REPORTS ====================

    @PostMapping("/{resourceId}/report")
    public ResponseEntity<?> reportResource(
            @PathVariable Long resourceId,
            @RequestBody ReportRequestDTO reportRequest) {
        try {
            resourceService.reportResource(resourceId, reportRequest.getUserId(), reportRequest);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resource reported successfully. Moderators will review it.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== MODERATION ====================

    @PostMapping("/{resourceId}/moderate")
    public ResponseEntity<?> moderateResource(
            @PathVariable Long resourceId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        try {
            Resource resource = resourceService.moderateResource(resourceId, status, notes);
            return ResponseEntity.ok(Map.of("message", "Resource moderated", "status", resource.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<?> updateResource(
            @PathVariable Long resourceId,
            @RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resource = resourceService.updateResource(resourceId, resourceDTO);
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId) {
        try {
            resourceService.deleteResource(resourceId);
            return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== COUNTERS ====================

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
            return ResponseEntity.ok(Map.of("message", "Download count incremented"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/recommended/{userId}")
    public ResponseEntity<List<Resource>> getRecommendedResources(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(resourceService.getRecommendedResources(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
