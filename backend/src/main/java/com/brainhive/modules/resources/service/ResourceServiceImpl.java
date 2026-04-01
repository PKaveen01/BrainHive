package com.brainhive.modules.resources.service;

import com.brainhive.modules.resources.dto.ResourceDTO;
import com.brainhive.modules.resources.dto.ReportRequestDTO;
import com.brainhive.modules.resources.model.Resource;
import com.brainhive.modules.resources.model.ResourceBookmark;
import com.brainhive.modules.resources.model.ResourceRating;
import com.brainhive.modules.resources.model.ResourceReport;
import com.brainhive.modules.resources.repository.ResourceBookmarkRepository;
import com.brainhive.modules.resources.repository.ResourceRatingRepository;
import com.brainhive.modules.resources.repository.ResourceReportRepository;
import com.brainhive.modules.resources.repository.ResourceRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRatingRepository ratingRepository;

    @Autowired
    private ResourceReportRepository reportRepository;

    @Autowired
    private ResourceBookmarkRepository bookmarkRepository;

    @Autowired
    private S3Service s3Service;

    @Override
    @Transactional
    public Resource uploadFileResource(MultipartFile file, ResourceDTO resourceDTO) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 50MB");
        }

        String originalFileName = file.getOriginalFilename();
        String lowerName = originalFileName == null ? "" : originalFileName.toLowerCase();

        boolean allowed =
                lowerName.endsWith(".pdf") ||
                        lowerName.endsWith(".doc") ||
                        lowerName.endsWith(".docx") ||
                        lowerName.endsWith(".ppt") ||
                        lowerName.endsWith(".pptx") ||
                        lowerName.endsWith(".jpg") ||
                        lowerName.endsWith(".jpeg") ||
                        lowerName.endsWith(".png");

        if (!allowed) {
            throw new RuntimeException("Only PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG files are allowed");
        }

        Long userId = Long.parseLong(resourceDTO.getUserId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + resourceDTO.getUserId()));

        String s3FileUrl = s3Service.uploadFile(file);

        Resource resource = new Resource();
        resource.setTitle(resourceDTO.getTitle());
        resource.setDescription(resourceDTO.getDescription());
        resource.setSubject(resourceDTO.getSubject());
        resource.setSemester(resourceDTO.getSemester());
        resource.setType(resourceDTO.getType());

        // store S3 URL inside filePath field
        resource.setFilePath(s3FileUrl);
        resource.setFileName(originalFileName);
        resource.setFileSize(file.getSize());
        resource.setFileType(file.getContentType());

        resource.setTags(resourceDTO.getTags());
        resource.setVisibility(resourceDTO.getVisibility() != null ? resourceDTO.getVisibility() : "public");
        resource.setCourseCode(resourceDTO.getCourseCode());
        resource.setLicense(resourceDTO.getLicense());
        resource.setAllowRatings(resourceDTO.getAllowRatings() != null ? resourceDTO.getAllowRatings() : true);
        resource.setAllowComments(resourceDTO.getAllowComments() != null ? resourceDTO.getAllowComments() : true);
        resource.setStatus("active");
        resource.setUploadedBy(user);

        return resourceRepository.save(resource);
    }

    @Override
    @Transactional
    public Resource uploadLinkResource(ResourceDTO resourceDTO) {
        Long userId = Long.parseLong(resourceDTO.getUserId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + resourceDTO.getUserId()));

        Resource resource = new Resource();
        resource.setTitle(resourceDTO.getTitle());
        resource.setDescription(resourceDTO.getDescription());
        resource.setSubject(resourceDTO.getSubject());
        resource.setSemester(resourceDTO.getSemester());
        resource.setType(resourceDTO.getType());
        resource.setLink(resourceDTO.getLink());
        resource.setTags(resourceDTO.getTags());
        resource.setVisibility(resourceDTO.getVisibility() != null ? resourceDTO.getVisibility() : "public");
        resource.setCourseCode(resourceDTO.getCourseCode());
        resource.setLicense(resourceDTO.getLicense());
        resource.setAllowRatings(resourceDTO.getAllowRatings() != null ? resourceDTO.getAllowRatings() : true);
        resource.setAllowComments(resourceDTO.getAllowComments() != null ? resourceDTO.getAllowComments() : true);
        resource.setStatus("active");
        resource.setUploadedBy(user);

        return resourceRepository.save(resource);
    }

    @Override
    public Page<Resource> searchResources(String query, String subject, String semester, String type, Pageable pageable) {
        return resourceRepository.searchResources(query, subject, semester, type, pageable);
    }

    @Override
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    @Override
    public List<Resource> getUserResources(String userId) {
        Long id = Long.parseLong(userId);
        return resourceRepository.findByUploadedById(id);
    }

    @Override
    public List<Resource> getRecentUserUploads(String userId) {
        Long id = Long.parseLong(userId);
        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "uploadedAt"));
        return resourceRepository.findRecentByUserId(id, pageable);
    }

    @Override
    public List<Resource> getUserBookmarkedResources(String userId) {
        Long id = Long.parseLong(userId);
        return resourceRepository.findBookmarkedByUserId(id);
    }

    @Override
    @Transactional
    public Resource updateResource(Long id, ResourceDTO resourceDTO) {
        Resource resource = getResourceById(id);

        resource.setTitle(resourceDTO.getTitle());
        resource.setDescription(resourceDTO.getDescription());
        resource.setSubject(resourceDTO.getSubject());
        resource.setSemester(resourceDTO.getSemester());
        resource.setTags(resourceDTO.getTags());
        resource.setVisibility(resourceDTO.getVisibility());
        resource.setCourseCode(resourceDTO.getCourseCode());
        resource.setLicense(resourceDTO.getLicense());
        resource.setAllowRatings(resourceDTO.getAllowRatings());
        resource.setAllowComments(resourceDTO.getAllowComments());

        return resourceRepository.save(resource);
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);

        if (resource.getFilePath() != null && !resource.getFilePath().isBlank()) {
            s3Service.deleteFileByUrl(resource.getFilePath());
        }

        resourceRepository.delete(resource);
    }

    @Override
    @Transactional
    public Resource bookmarkResource(Long resourceId, String userId) {
        Resource resource = getResourceById(resourceId);
        Long id = Long.parseLong(userId);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!bookmarkRepository.existsByResourceIdAndUserId(resourceId, id)) {
            ResourceBookmark bookmark = new ResourceBookmark();
            bookmark.setResource(resource);
            bookmark.setUser(user);
            bookmarkRepository.save(bookmark);
        }

        return resource;
    }

    @Override
    @Transactional
    public Resource removeBookmark(Long resourceId, String userId) {
        Long id = Long.parseLong(userId);
        bookmarkRepository.deleteByResourceIdAndUserId(resourceId, id);
        return getResourceById(resourceId);
    }

    @Override
    public boolean isResourceBookmarked(Long resourceId, String userId) {
        Long id = Long.parseLong(userId);
        return bookmarkRepository.existsByResourceIdAndUserId(resourceId, id);
    }

    @Override
    @Transactional
    public Resource rateResource(Long resourceId, String userId, Integer rating, String review) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Resource resource = getResourceById(resourceId);
        Long id = Long.parseLong(userId);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ResourceRating existingRating = ratingRepository.findByResourceIdAndUserId(resourceId, id);

        if (existingRating != null) {
            existingRating.setRating(rating);
            existingRating.setReview(review);
            ratingRepository.save(existingRating);
        } else {
            ResourceRating newRating = new ResourceRating();
            newRating.setResource(resource);
            newRating.setUser(user);
            newRating.setRating(rating);
            newRating.setReview(review);
            ratingRepository.save(newRating);
        }

        updateResourceAverageRating(resource);
        return resource;
    }

    private void updateResourceAverageRating(Resource resource) {
        Double avgRating = ratingRepository.getAverageRatingForResource(resource.getId());
        resource.setAverageRating(avgRating != null ? avgRating : 0.0);

        Long count = ratingRepository.countByResourceId(resource.getId());
        resource.setRatingCount(count != null ? count.intValue() : 0);

        resourceRepository.save(resource);
    }

    @Override
    public Double getResourceAverageRating(Long resourceId) {
        return ratingRepository.getAverageRatingForResource(resourceId);
    }

    @Override
    @Transactional
    public Resource reportResource(Long resourceId, String userId, ReportRequestDTO reportRequest) {
        Resource resource = getResourceById(resourceId);
        Long id = Long.parseLong(userId);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ResourceReport report = new ResourceReport();
        report.setResource(resource);
        report.setReportedBy(user);
        report.setReason(reportRequest.getReason());
        report.setDescription(reportRequest.getDescription());
        report.setStatus("pending");

        reportRepository.save(report);

        long reportCount = reportRepository.countByResourceIdAndStatus(resourceId, "pending");
        if (reportCount >= 3) {
            resource.setStatus("flagged");
            resourceRepository.save(resource);
        }

        return resource;
    }

    @Override
    @Transactional
    public Resource moderateResource(Long resourceId, String status, String notes) {
        Resource resource = getResourceById(resourceId);
        resource.setStatus(status);
        resource.setModerationNotes(notes);
        resource.setModeratedAt(LocalDateTime.now());

        return resourceRepository.save(resource);
    }

    @Override
    @Transactional
    public void incrementViewCount(Long resourceId) {
        resourceRepository.findById(resourceId).ifPresent(resource -> {
            resource.setViewCount(resource.getViewCount() + 1);
            resourceRepository.save(resource);
        });
    }

    @Override
    @Transactional
    public void incrementDownloadCount(Long resourceId) {
        resourceRepository.findById(resourceId).ifPresent(resource -> {
            resource.setDownloadCount(resource.getDownloadCount() + 1);
            resourceRepository.save(resource);
        });
    }

    @Override
    public List<Resource> getRecommendedResources(String userId) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "viewCount"));
        return resourceRepository.findByStatus("active", pageable).getContent();
    }
}