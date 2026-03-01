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
@RequestMapping("/api/dashboard/student")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentDashboardController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public ResponseEntity<?> getStudentInfo(HttpSession session) {
        // Check if user is authenticated
        if (!userService.isAuthenticated(session)) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != com.brainhive.modules.user.model.UserRole.STUDENT) {
            return ResponseEntity.status(403).body("Access denied");
        }

        // Return dummy data for student dashboard
        Map<String, Object> response = new HashMap<>();
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("program", "Computer Science, Year 3");
        response.put("date", "Tuesday, Oct 24");

        // Dummy data for dashboard
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("user", response);

        // Recommended resources
        dashboardData.put("recommendedResources", new Object[]{
                Map.of("title", "Binary Trees Explained", "type", "PDF Notes", "subject", "Data Structures"),
                Map.of("title", "Database Normalization", "type", "Video", "subject", "Database Systems"),
                Map.of("title", "Java Collections", "type", "PDF Notes", "subject", "Programming")
        });

        // Academic focus areas
        dashboardData.put("focusAreas", new String[]{
                "Data Structures", "Database Systems", "Programming (Java)"
        });

        // Upcoming schedule
        dashboardData.put("upcomingSchedule", new Object[]{
                Map.of("title", "Data Structures Tutoring", "time", "Today, 4:00 PM"),
                Map.of("title", "CS301 Project Meeting", "time", "Tomorrow, 2:00 PM")
        });

        return ResponseEntity.ok(dashboardData);
    }
}