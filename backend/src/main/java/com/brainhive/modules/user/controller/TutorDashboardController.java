package com.brainhive.modules.user.controller;

import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/tutor")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorDashboardController {

    @Autowired private UserService userService;
    @Autowired private TutorProfileRepository tutorProfileRepository;
    @Autowired private TutorSessionRepository tutorSessionRepository;
    @Autowired private HelpRequestRepository helpRequestRepository;

    @GetMapping("/info")
    public ResponseEntity<?> getTutorInfo(HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return ResponseEntity.status(403).body("Access denied");

        Map<String, Object> data = new HashMap<>();
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());

        tutorProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            data.put("qualification", profile.getQualification());
            data.put("bio", profile.getBio());
            data.put("verificationStatus", profile.getVerificationStatus());
            data.put("isAvailable", profile.getIsAvailable());
            data.put("proficiencyLevel", profile.getProficiencyLevel());

            if (profile.getSubject() != null)
                data.put("subject", profile.getSubject().getName());

            if (profile.getExpertSubjects() != null) {
                data.put("expertSubjects", profile.getExpertSubjects().stream()
                        .map(s -> s.getName()).collect(Collectors.toList()));
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSessions", profile.getTotalSessions() != null ? profile.getTotalSessions() : 0);
            stats.put("averageRating", profile.getAverageRating() != null ? profile.getAverageRating() : 0.0);
            stats.put("credibilityScore", profile.getCredibilityScore() != null ? profile.getCredibilityScore() : 0.0);
            // Count from DB
            stats.put("pendingRequests", helpRequestRepository.findByAssignedTutorId(user.getId()).stream()
                    .filter(r -> r.getStatus().toString().equals("PENDING") || r.getStatus().toString().equals("APPROVED"))
                    .count());
            stats.put("totalSessionsDb", tutorSessionRepository.findByTutorId(user.getId()).size());
            data.put("stats", stats);
        });

        return ResponseEntity.ok(data);
    }
}
