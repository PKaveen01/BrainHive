package com.brainhive.modules.user.controller;

import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/tutor")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorDashboardController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public ResponseEntity<?> getTutorInfo(HttpSession session) {
        // Check if user is authenticated
        if (!userService.isAuthenticated(session)) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != com.brainhive.modules.user.model.UserRole.TUTOR) {
            return ResponseEntity.status(403).body("Access denied");
        }

        // Return dummy data for tutor dashboard
        Map<String, Object> response = new HashMap<>();
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("title", "Dr.");
        response.put("department", "Computer Science Department");
        response.put("date", "Tuesday, Oct 24");

        // Dummy data for dashboard
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("user", response);

        // Pending help requests
        dashboardData.put("pendingRequests", new Object[]{
                Map.of(
                        "student", "Alex Johnson",
                        "subject", "Data Structures : AVL Trees",
                        "time", "Tomorrow, 2:00 PM",
                        "status", "pending"
                ),
                Map.of(
                        "student", "Emma Davis",
                        "subject", "Algorithms : Dynamic Programming",
                        "time", "Thursday, 10:00 AM",
                        "status", "pending"
                )
        });

        // Stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCompleted", 124);
        stats.put("averageRating", 4.9);
        dashboardData.put("stats", stats);

        return ResponseEntity.ok(dashboardData);
    }
}