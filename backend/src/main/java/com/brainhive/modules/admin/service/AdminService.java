package com.brainhive.modules.admin.service;

import com.brainhive.modules.admin.dto.*;
import com.brainhive.modules.peerhelp.dto.LectureResponseDTO;
import com.brainhive.modules.peerhelp.model.Lecture;
import com.brainhive.modules.peerhelp.repository.LectureRepository;
import com.brainhive.modules.resources.model.Resource;
import com.brainhive.modules.resources.repository.ResourceRepository;
import com.brainhive.modules.resources.repository.ResourceReportRepository;
import com.brainhive.modules.user.dto.AddUserRequest;
import com.brainhive.modules.user.dto.AdminUserDTO;
import com.brainhive.modules.user.model.StudentProfile;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.StudentProfileRepository;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private TutorProfileRepository tutorProfileRepository;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private ResourceReportRepository resourceReportRepository;
    @Autowired private LectureRepository lectureRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─── Stats ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        List<User> allUsers = userRepository.findAll();
        long totalStudents   = allUsers.stream().filter(u -> u.getRole() == UserRole.STUDENT).count();
        long totalTutors     = allUsers.stream().filter(u -> u.getRole() == UserRole.TUTOR).count();
        long pendingTutors   = tutorProfileRepository.findByVerificationStatus("PENDING").size();
        long approvedTutors  = tutorProfileRepository.findByVerificationStatus("APPROVED").size();
        long totalResources  = resourceRepository.count();
        long activeResources  = resourceRepository.findByStatus("active").size();
        long pendingResources = resourceRepository.findByStatus("pending").size();
        long flaggedResources = resourceRepository.findByStatus("flagged").size();
        long pendingReports   = resourceReportRepository.countByStatus("pending");

        AdminStatsDTO s = new AdminStatsDTO();
        s.setTotalUsers(allUsers.size());
        s.setTotalStudents(totalStudents);
        s.setTotalTutors(totalTutors);
        s.setPendingTutors(pendingTutors);
        s.setApprovedTutors(approvedTutors);
        s.setTotalResources(totalResources);
        s.setActiveResources(activeResources);
        s.setPendingResources(pendingResources);
        s.setFlaggedResources(flaggedResources);
        s.setPendingReports(pendingReports);
        return s;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long totalStudents   = userRepository.findByRole(UserRole.STUDENT).size();
        long totalTutors     = userRepository.findByRole(UserRole.TUTOR).stream()
                .filter(u -> "ACTIVE".equals(u.getAccountStatus())).count();
        long pendingTutors   = userRepository.findByRole(UserRole.TUTOR).stream()
                .filter(u -> "PENDING".equals(u.getAccountStatus())).count();
        long terminatedUsers = userRepository.findAll().stream()
                .filter(u -> "TERMINATED".equals(u.getAccountStatus())).count();

        return Map.of(
                "totalStudents",   totalStudents,
                "totalTutors",     totalTutors,
                "pendingTutors",   pendingTutors,
                "terminatedUsers", terminatedUsers,
                "totalUsers",      totalStudents + totalTutors
        );
    }

    // ─── Users ───────────────────────────────────────────────────────────────

    /** Returns all users as UserDTO (simpler view used by original admin module) */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserDTO).collect(Collectors.toList());
    }

    /** Returns all non-admin users as AdminUserDTO (richer view with account status) */
    @Transactional(readOnly = true)
    public List<AdminUserDTO> getAllUsersDetailed() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> terminateUser(Long userId, int durationDays) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Map.of("success", false, "message", "User not found.");
        if (user.getRole() == UserRole.ADMIN) return Map.of("success", false, "message", "Cannot terminate an admin.");

        user.setAccountStatus("TERMINATED");
        user.setTerminatedUntil(LocalDateTime.now().plusDays(durationDays));
        userRepository.save(user);
        return Map.of("success", true, "message", "User terminated for " + durationDays + " days.");
    }

    @Transactional
    public Map<String, Object> reactivateUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Map.of("success", false, "message", "User not found.");

        user.setAccountStatus("ACTIVE");
        user.setTerminatedUntil(null);
        userRepository.save(user);
        return Map.of("success", true, "message", "User reactivated successfully.");
    }

    @Transactional
    public Map<String, Object> removeUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Map.of("success", false, "message", "User not found.");
        if (user.getRole() == UserRole.ADMIN) return Map.of("success", false, "message", "Cannot remove an admin.");

        userRepository.delete(user);
        return Map.of("success", true, "message", "User removed from the system.");
    }

    @Transactional
    public Map<String, Object> addUser(AddUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            return Map.of("success", false, "message", "Email already registered.");

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            return Map.of("success", false, "message", "Invalid role. Must be STUDENT or TUTOR.");
        }
        if (role == UserRole.ADMIN) return Map.of("success", false, "message", "Cannot create admin accounts via this form.");

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setAccountStatus("ACTIVE");
        user = userRepository.save(user);

        if (role == UserRole.TUTOR) {
            TutorProfile tp = new TutorProfile(user);
            tp.setQualification(request.getQualification() != null ? request.getQualification() : "");
            tp.setBio(request.getBio() != null ? request.getBio() : "");
            tp.setProfileCompleted(true);
            tp.setVerificationStatus("APPROVED");
            tutorProfileRepository.save(tp);
        } else {
            StudentProfile sp = new StudentProfile(user);
            sp.setProfileCompleted(false);
            sp.setProfileCompletionPercentage(0);
            studentProfileRepository.save(sp);
        }
        return Map.of("success", true, "message", "User added successfully.", "userId", user.getId());
    }

    // ─── Tutors ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TutorApplicationDTO> getPendingTutors() {
        return tutorProfileRepository.findByVerificationStatus("PENDING").stream()
                .map(this::toTutorApplicationDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TutorApplicationDTO> getAllTutors() {
        return tutorProfileRepository.findAll().stream()
                .map(this::toTutorApplicationDTO).collect(Collectors.toList());
    }

    @Transactional
    public TutorApplicationDTO approveTutor(Long tutorProfileId) {
        TutorProfile tp = tutorProfileRepository.findById(tutorProfileId)
                .orElseThrow(() -> new RuntimeException("Tutor profile not found: " + tutorProfileId));
        tp.setVerificationStatus("APPROVED");
        tp.setIsAvailable(true);
        tutorProfileRepository.save(tp);

        // Also update user account status
        User user = tp.getUser();
        user.setAccountStatus("ACTIVE");
        userRepository.save(user);

        return toTutorApplicationDTO(tp);
    }

    @Transactional
    public TutorApplicationDTO rejectTutor(Long tutorProfileId, String reason) {
        TutorProfile tp = tutorProfileRepository.findById(tutorProfileId)
                .orElseThrow(() -> new RuntimeException("Tutor profile not found: " + tutorProfileId));
        tp.setVerificationStatus("REJECTED");
        tp.setIsAvailable(false);
        tutorProfileRepository.save(tp);

        User user = tp.getUser();
        user.setAccountStatus("REJECTED");
        userRepository.save(user);

        return toTutorApplicationDTO(tp);
    }

    /** Approve tutor by userId (used by friend's AdminController) */
    @Transactional
    public Map<String, Object> approveTutorByUserId(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return Map.of("success", false, "message", "Tutor not found.");

        user.setAccountStatus("ACTIVE");
        userRepository.save(user);
        tutorProfileRepository.findByUserId(userId).ifPresent(tp -> {
            tp.setVerificationStatus("APPROVED");
            tutorProfileRepository.save(tp);
        });
        return Map.of("success", true, "message", "Tutor approved successfully.");
    }

    /** Reject tutor by userId (used by friend's AdminController) */
    @Transactional
    public Map<String, Object> rejectTutorByUserId(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return Map.of("success", false, "message", "Tutor not found.");

        user.setAccountStatus("REJECTED");
        userRepository.save(user);
        tutorProfileRepository.findByUserId(userId).ifPresent(tp -> {
            tp.setVerificationStatus("REJECTED");
            tutorProfileRepository.save(tp);
        });
        return Map.of("success", true, "message", "Tutor request rejected.");
    }

    // ─── Resources ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ResourceModDTO> getReportedResources() {
        Set<Resource> combined = new LinkedHashSet<>();
        combined.addAll(resourceRepository.findByStatus("flagged"));
        combined.addAll(resourceRepository.findByStatus("pending"));
        return combined.stream().map(this::toResourceModDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResourceModDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::toResourceModDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResourceModDTO approveResource(Long resourceId) {
        Resource r = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));
        r.setStatus("active");
        r.setModeratedAt(LocalDateTime.now());
        return toResourceModDTO(resourceRepository.save(r));
    }

    @Transactional
    public ResourceModDTO removeResource(Long resourceId) {
        Resource r = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));
        r.setStatus("removed");
        r.setModeratedAt(LocalDateTime.now());
        return toResourceModDTO(resourceRepository.save(r));
    }

    // ─── Lectures ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LectureResponseDTO> getAllLectures() {
        return lectureRepository.findAllByOrderByScheduledAtDesc()
                .stream()
                .map(LectureResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> deleteLecture(Long lectureId) {
        if (!lectureRepository.existsById(lectureId))
            return Map.of("success", false, "message", "Lecture not found.");
        lectureRepository.deleteById(lectureId);
        return Map.of("success", true, "message", "Lecture deleted successfully.");
    }

    // ─── Mapping helpers ─────────────────────────────────────────────────────

    private TutorApplicationDTO toTutorApplicationDTO(TutorProfile tp) {
        TutorApplicationDTO dto = new TutorApplicationDTO();
        dto.setId(tp.getId());
        // user is lazy — safe inside @Transactional
        if (tp.getUser() != null) {
            dto.setUserId(tp.getUser().getId());
            dto.setName(tp.getUser().getFullName());
            dto.setEmail(tp.getUser().getEmail());
        }
        dto.setQualification(tp.getQualification());
        dto.setBio(tp.getBio());
        dto.setYearsOfExperience(tp.getYearsOfExperience());
        dto.setVerificationStatus(tp.getVerificationStatus());
        dto.setAverageRating(tp.getAverageRating());
        dto.setTotalSessions(tp.getTotalSessions());
        if (tp.getSubject() != null) dto.setSubject(tp.getSubject().getName());
        try {
            if (tp.getExpertSubjects() != null && !tp.getExpertSubjects().isEmpty())
                dto.setExpertSubjects(tp.getExpertSubjects().stream()
                        .map(s -> s.getName()).collect(Collectors.toList()));
        } catch (Exception ignored) {
            // expertSubjects lazy load failed — leave as null, non-critical
        }
        dto.setCreatedAt(tp.getCreatedAt());
        return dto;
    }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().toString());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    private AdminUserDTO toAdminUserDTO(User u) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setFullName(u.getFullName());
        dto.setRole(u.getRole().toString());
        dto.setAccountStatus(u.getAccountStatus());
        dto.setTerminatedUntil(u.getTerminatedUntil());
        dto.setCreatedAt(u.getCreatedAt());
        if (u.getRole() == UserRole.TUTOR) {
            tutorProfileRepository.findByUserId(u.getId()).ifPresent(tp -> {
                dto.setVerificationStatus(tp.getVerificationStatus());
                dto.setQualification(tp.getQualification());
            });
        }
        return dto;
    }

    private ResourceModDTO toResourceModDTO(Resource r) {
        ResourceModDTO dto = new ResourceModDTO();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setSubject(r.getSubject());
        dto.setType(r.getType());
        dto.setStatus(r.getStatus());
        dto.setUploadedAt(r.getUploadedAt());
        if (r.getUploadedBy() != null) {
            dto.setUploadedBy(r.getUploadedBy().getFullName());
            dto.setUploadedByEmail(r.getUploadedBy().getEmail());
        }
        dto.setModerationNotes(r.getModerationNotes());
        return dto;
    }
}