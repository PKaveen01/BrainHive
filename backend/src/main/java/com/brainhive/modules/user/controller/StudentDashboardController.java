package com.brainhive.modules.user.controller;

import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.resources.repository.ResourceBookmarkRepository;
import com.brainhive.modules.user.model.StudentProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.StudentProfileRepository;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/student")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentDashboardController {

    @Autowired private UserService userService;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private HelpRequestRepository helpRequestRepository;
    @Autowired private TutorSessionRepository tutorSessionRepository;
    @Autowired private ResourceBookmarkRepository resourceBookmarkRepository;

    @GetMapping("/info")
    public ResponseEntity<?> getStudentInfo(HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.STUDENT)
            return ResponseEntity.status(403).body("Access denied");

        Map<String, Object> data = new HashMap<>();
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());

        // Profile data
        studentProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            data.put("program", profile.getDegreeProgram() != null ? profile.getDegreeProgram() : "");
            data.put("year", profile.getCurrentYear() != null ? profile.getCurrentYear() : "");
            data.put("semester", profile.getCurrentSemester() != null ? profile.getCurrentSemester() : "");
            data.put("studyStyle", profile.getStudyStyle() != null ? profile.getStudyStyle() : "");
            data.put("profileCompletion", profile.getProfileCompletionPercentage() != null ? profile.getProfileCompletionPercentage() : 0);
            data.put("profileCompleted", profile.getProfileCompleted() != null ? profile.getProfileCompleted() : false);

            // Subjects
            if (profile.getSubjects() != null) {
                List<Map<String, Object>> subjects = profile.getSubjects().stream().map(s -> {
                    Map<String, Object> sm = new HashMap<>();
                    sm.put("id", s.getId());
                    sm.put("name", s.getName());
                    boolean isWeak = profile.getWeakSubjects() != null && profile.getWeakSubjects().contains(s.getName());
                    sm.put("strength", isWeak ? 30 : 75);
                    sm.put("status", isWeak ? "Needs attention" : "Good");
                    return sm;
                }).collect(Collectors.toList());
                data.put("focusAreas", subjects);
            }

            // Weak subjects list
            if (profile.getWeakSubjects() != null)
                data.put("weakSubjects", new ArrayList<>(profile.getWeakSubjects()));
        });

        // Real stats from DB
        Map<String, Object> stats = new HashMap<>();
        stats.put("helpSessions", tutorSessionRepository.findByStudentId(user.getId()).size());
        stats.put("resourcesSaved", resourceBookmarkRepository.countByUserId(user.getId()));
        stats.put("studyStreak", 1); // Can be expanded later
        data.put("stats", stats);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updateStudentProfile(@RequestBody Map<String, Object> updates, HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.STUDENT)
            return ResponseEntity.status(403).body("Access denied");

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElse(new StudentProfile(user));

        if (updates.containsKey("degreeProgram")) profile.setDegreeProgram((String) updates.get("degreeProgram"));
        if (updates.containsKey("currentYear")) profile.setCurrentYear((String) updates.get("currentYear"));
        if (updates.containsKey("currentSemester")) profile.setCurrentSemester((String) updates.get("currentSemester"));
        if (updates.containsKey("studyStyle")) profile.setStudyStyle((String) updates.get("studyStyle"));
        if (updates.containsKey("availabilityHours")) {
            Object ah = updates.get("availabilityHours");
            if (ah instanceof Integer) profile.setAvailabilityHours((Integer) ah);
            else if (ah instanceof String) { try { profile.setAvailabilityHours(Integer.parseInt((String) ah)); } catch (Exception ignored) {} }
        }

        @SuppressWarnings("unchecked")
        List<String> weakSubjects = (List<String>) updates.get("weakSubjects");
        if (weakSubjects != null) profile.setWeakSubjects(new HashSet<>(weakSubjects));

        // Recalculate completion
        int pts = 0;
        if (profile.getDegreeProgram() != null && !profile.getDegreeProgram().isEmpty()) pts++;
        if (profile.getCurrentYear() != null && !profile.getCurrentYear().isEmpty()) pts++;
        if (profile.getCurrentSemester() != null && !profile.getCurrentSemester().isEmpty()) pts++;
        if (profile.getSubjects() != null && !profile.getSubjects().isEmpty()) pts++;
        if (profile.getStudyStyle() != null && !profile.getStudyStyle().isEmpty()) pts++;
        profile.setProfileCompletionPercentage(pts * 20);
        profile.setProfileCompleted(pts == 5);

        studentProfileRepository.save(profile);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "profileCompletion", profile.getProfileCompletionPercentage()));
    }
}
