package com.brainhive.modules.admin.controller;

import com.brainhive.modules.admin.dto.*;
import com.brainhive.modules.admin.service.AdminService;
import com.brainhive.modules.peerhelp.dto.LectureResponseDTO;
import com.brainhive.modules.user.dto.AddUserRequest;
import com.brainhive.modules.user.dto.TerminateUserRequest;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    // ─── Auth helpers ─────────────────────────────────────────────────────────

    private ResponseEntity<?> checkAdmin(HttpSession session) {
        User user = userService.getCurrentUser(session);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        if (user.getRole() != UserRole.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin access required"));
        return null;
    }

    private boolean isAdmin(HttpSession session) {
        String role = (String) session.getAttribute("userRole");
        return "ADMIN".equals(role);
    }

    // ─── Stats ───────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ─── Tutors ──────────────────────────────────────────────────────────────

    @GetMapping("/tutors/pending")
    public ResponseEntity<?> getPendingTutorProfiles(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getPendingTutors());
    }

    @GetMapping("/pending-tutors")
    public ResponseEntity<?> getPendingTutors(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getPendingTutors());
    }

    @GetMapping("/tutors")
    public ResponseEntity<?> getAllTutors(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getAllTutors());
    }

    /** Approve tutor by TutorProfile ID */
    @PostMapping("/tutors/{id}/approve")
    public ResponseEntity<?> approveTutor(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        try {
            return ResponseEntity.ok(adminService.approveTutor(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Approve tutor by User ID */
    @PostMapping("/tutors/{userId}/approve-by-user")
    public ResponseEntity<?> approveTutorByUser(@PathVariable Long userId, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.approveTutorByUserId(userId));
    }

    /** Reject tutor by TutorProfile ID */
    @PostMapping("/tutors/{id}/reject")
    public ResponseEntity<?> rejectTutor(@PathVariable Long id,
                                          @RequestBody(required = false) Map<String, String> body,
                                          HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        try {
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(adminService.rejectTutor(id, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Reject tutor by User ID */
    @PostMapping("/tutors/{userId}/reject-by-user")
    public ResponseEntity<?> rejectTutorByUser(@PathVariable Long userId, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.rejectTutorByUserId(userId));
    }

    // ─── Users ───────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getAllUsersDetailed());
    }

    @PostMapping("/users/{userId}/terminate")
    public ResponseEntity<?> terminateUser(@PathVariable Long userId,
                                           @RequestBody TerminateUserRequest request,
                                           HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.terminateUser(userId, request.getDurationDays()));
    }

    @PostMapping("/users/{userId}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long userId, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.reactivateUser(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> removeUser(@PathVariable Long userId, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.removeUser(userId));
    }

    @PostMapping("/users/add")
    public ResponseEntity<?> addUser(@RequestBody AddUserRequest request, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.addUser(request));
    }

    // ─── Resources ───────────────────────────────────────────────────────────

    @GetMapping("/resources/reported")
    public ResponseEntity<?> getReportedResources(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getReportedResources());
    }

    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getAllResources());
    }

    @PostMapping("/resources/{id}/approve")
    public ResponseEntity<?> approveResource(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        try {
            return ResponseEntity.ok(adminService.approveResource(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/resources/{id}/remove")
    public ResponseEntity<?> removeResource(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        try {
            return ResponseEntity.ok(adminService.removeResource(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── Lectures ─────────────────────────────────────────────────────────────

    @GetMapping("/lectures")
    public ResponseEntity<?> getAllLectures(HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.getAllLectures());
    }

    @DeleteMapping("/lectures/{lectureId}")
    public ResponseEntity<?> deleteLecture(@PathVariable Long lectureId, HttpSession session) {
        ResponseEntity<?> check = checkAdmin(session);
        if (check != null) return check;
        return ResponseEntity.ok(adminService.deleteLecture(lectureId));
    }
}
