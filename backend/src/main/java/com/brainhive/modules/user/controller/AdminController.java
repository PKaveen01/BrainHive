package com.brainhive.modules.user.controller;

import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.repository.UserRepository;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserService userService;

    // ── Auth check helper ──────────────────────────────────────────────────
    private boolean isAdmin(HttpSession session) {
        if (!userService.isAuthenticated(session)) return false;
        User user = userService.getCurrentUser(session);
        return user != null && user.getRole() == UserRole.ADMIN;
    }

    // ── Stats overview ─────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalTutors   = userRepository.countByRoleAndAccountStatus(UserRole.TUTOR, "ACTIVE");
        long pendingTutors = userRepository.countByRoleAndAccountStatus(UserRole.TUTOR, "PENDING");
        long totalUsers    = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",    totalUsers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalTutors",   totalTutors);
        stats.put("pendingTutors", pendingTutors);
        return ResponseEntity.ok(stats);
    }

    // ── Pending tutor applications ─────────────────────────────────────────
    @GetMapping("/tutors/pending")
    public ResponseEntity<?> getPendingTutors(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        List<User> pendingUsers = userRepository.findByRoleAndAccountStatus(UserRole.TUTOR, "PENDING");

        List<Map<String, Object>> result = pendingUsers.stream().map(user -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id",        user.getId());
            item.put("name",      user.getFullName());
            item.put("email",     user.getEmail());
            item.put("status",    user.getAccountStatus());
            item.put("createdAt", user.getCreatedAt());

            // Attach tutor profile details if available
            tutorProfileRepository.findByUser(user).ifPresent(profile -> {
                item.put("qualification",      profile.getQualification());
                item.put("yearsOfExperience",  profile.getYearsOfExperience());
                item.put("bio",                profile.getBio());
                item.put("verificationStatus", profile.getVerificationStatus());
            });
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── All tutors ─────────────────────────────────────────────────────────
    @GetMapping("/tutors")
    public ResponseEntity<?> getAllTutors(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        List<User> tutors = userRepository.findByRole(UserRole.TUTOR);
        List<Map<String, Object>> result = tutors.stream().map(user -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id",            user.getId());
            item.put("name",          user.getFullName());
            item.put("email",         user.getEmail());
            item.put("accountStatus", user.getAccountStatus());
            item.put("createdAt",     user.getCreatedAt());

            tutorProfileRepository.findByUser(user).ifPresent(profile -> {
                item.put("qualification",      profile.getQualification());
                item.put("yearsOfExperience",  profile.getYearsOfExperience());
                item.put("verificationStatus", profile.getVerificationStatus());
            });
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Approve tutor ──────────────────────────────────────────────────────
    @PostMapping("/tutors/{id}/approve")
    public ResponseEntity<?> approveTutor(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        User user = userRepository.findById(id).orElse(null);
        if (user == null || user.getRole() != UserRole.TUTOR) {
            return ResponseEntity.badRequest().body("Tutor not found");
        }

        user.setAccountStatus("ACTIVE");
        userRepository.save(user);

        tutorProfileRepository.findByUser(user).ifPresent(profile -> {
            profile.setVerificationStatus("APPROVED");
            tutorProfileRepository.save(profile);
        });

        return ResponseEntity.ok(Map.of("success", true, "message", "Tutor approved successfully"));
    }

    // ── Reject tutor ───────────────────────────────────────────────────────
    @PostMapping("/tutors/{id}/reject")
    public ResponseEntity<?> rejectTutor(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        User user = userRepository.findById(id).orElse(null);
        if (user == null || user.getRole() != UserRole.TUTOR) {
            return ResponseEntity.badRequest().body("Tutor not found");
        }

        user.setAccountStatus("SUSPENDED");
        userRepository.save(user);

        tutorProfileRepository.findByUser(user).ifPresent(profile -> {
            profile.setVerificationStatus("REJECTED");
            tutorProfileRepository.save(profile);
        });

        return ResponseEntity.ok(Map.of("success", true, "message", "Tutor application rejected"));
    }

    // ── All users ──────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id",            user.getId());
            item.put("name",          user.getFullName());
            item.put("email",         user.getEmail());
            item.put("role",          user.getRole().toString());
            item.put("accountStatus", user.getAccountStatus());
            item.put("createdAt",     user.getCreatedAt());
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Suspend user ───────────────────────────────────────────────────────
    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        user.setAccountStatus("SUSPENDED");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "User suspended"));
    }

    // ── Activate user ──────────────────────────────────────────────────────
    @PostMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Access denied");

        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        user.setAccountStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "User activated"));
    }
}
