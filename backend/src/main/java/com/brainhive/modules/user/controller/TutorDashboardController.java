package com.brainhive.modules.user.controller;

import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.SubjectRepository;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.repository.UserRepository;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/tutor")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorDashboardController {

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private TutorProfileRepository tutorProfileRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private TutorSessionRepository tutorSessionRepository;
    @Autowired private HelpRequestRepository helpRequestRepository;

    @GetMapping("/info")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getTutorInfo(HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return ResponseEntity.status(403).body("Access denied");

        Map<String, Object> data = new HashMap<>();
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());

        // Use eager-fetch query for expertSubjects to avoid LazyInitializationException
        tutorProfileRepository.findByUserIdWithSubjects(user.getId()).ifPresent(profile -> {
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
            stats.put("pendingRequests", helpRequestRepository.findByAssignedTutorId(user.getId()).stream()
                    .filter(r -> r.getStatus().toString().equals("PENDING") || r.getStatus().toString().equals("APPROVED"))
                    .count());
            stats.put("totalSessionsDb", tutorSessionRepository.findByTutorId(user.getId()).size());
            data.put("stats", stats);
        });

        return ResponseEntity.ok(data);
    }

    /**
     * GET full tutor profile for the profile view/edit pages.
     *
     * Root cause fix: expertSubjects and availabilitySlots are LAZY collections.
     * Accessing them outside a Hibernate session causes LazyInitializationException.
     * We use two dedicated JOIN FETCH queries (one per collection) and annotate the
     * method @Transactional so the session stays open for the duration of the call.
     * Two separate queries are required because fetching two bag-typed collections
     * in a single JOIN FETCH causes a MultipleBagFetchException / cartesian product.
     */
    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getTutorProfile(HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return ResponseEntity.status(403).body("Access denied");

        Map<String, Object> data = new HashMap<>();
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());

        // Fetch profile with expertSubjects eagerly loaded
        Optional<TutorProfile> profileWithSubjects =
                tutorProfileRepository.findByUserIdWithSubjects(user.getId());

        // Fetch profile again with availabilitySlots eagerly loaded (second query)
        Optional<TutorProfile> profileWithSlots =
                tutorProfileRepository.findByUserIdWithSlots(user.getId());

        profileWithSubjects.ifPresent(profile -> {
            data.put("qualification", profile.getQualification());
            data.put("bio", profile.getBio());
            data.put("yearsOfExperience", profile.getYearsOfExperience());
            data.put("verificationStatus", profile.getVerificationStatus());
            data.put("isAvailable", profile.getIsAvailable());
            data.put("maxConcurrentStudents", profile.getMaxConcurrentStudents());
            data.put("totalSessions", profile.getTotalSessions() != null ? profile.getTotalSessions() : 0);
            data.put("averageRating", profile.getAverageRating() != null ? profile.getAverageRating() : 0.0);
            data.put("credibilityScore", profile.getCredibilityScore() != null ? profile.getCredibilityScore() : 0.0);

            List<String> subjectNames = (profile.getExpertSubjects() != null)
                    ? profile.getExpertSubjects().stream()
                        .map(Subject::getName)
                        .collect(Collectors.toList())
                    : new ArrayList<>();
            data.put("expertSubjects", subjectNames);
        });

        profileWithSlots.ifPresent(profile -> {
            List<String> slots = (profile.getAvailabilitySlots() != null)
                    ? new ArrayList<>(profile.getAvailabilitySlots())
                    : new ArrayList<>();
            data.put("availabilitySlots", slots);
        });

        // Guard: ensure keys are always present even when no TutorProfile exists yet
        data.putIfAbsent("expertSubjects", new ArrayList<>());
        data.putIfAbsent("availabilitySlots", new ArrayList<>());

        return ResponseEntity.ok(data);
    }

    /**
     * PUT update tutor profile fields from the edit page.
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateTutorProfile(@RequestBody Map<String, Object> updates, HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.TUTOR)
            return ResponseEntity.status(403).body("Access denied");

        // Use findByUserIdWithSubjects so the collection is in-session before mutation
        TutorProfile profile = tutorProfileRepository.findByUserIdWithSubjects(user.getId())
                .orElse(new TutorProfile(user));

        if (updates.containsKey("qualification"))
            profile.setQualification((String) updates.get("qualification"));

        if (updates.containsKey("bio"))
            profile.setBio((String) updates.get("bio"));

        if (updates.containsKey("yearsOfExperience")) {
            Object ye = updates.get("yearsOfExperience");
            if (ye instanceof Integer) profile.setYearsOfExperience((Integer) ye);
            else if (ye instanceof Number) profile.setYearsOfExperience(((Number) ye).intValue());
            else if (ye instanceof String) {
                try { profile.setYearsOfExperience(Integer.parseInt((String) ye)); } catch (Exception ignored) {}
            }
        }

        if (updates.containsKey("maxConcurrentStudents")) {
            Object mc = updates.get("maxConcurrentStudents");
            if (mc instanceof Integer) profile.setMaxConcurrentStudents((Integer) mc);
            else if (mc instanceof Number) profile.setMaxConcurrentStudents(((Number) mc).intValue());
            else if (mc instanceof String) {
                try { profile.setMaxConcurrentStudents(Integer.parseInt((String) mc)); } catch (Exception ignored) {}
            }
        }

        if (updates.containsKey("isAvailable"))
            profile.setIsAvailable((Boolean) updates.get("isAvailable"));

        // Availability slots
        @SuppressWarnings("unchecked")
        List<String> slots = (List<String>) updates.get("availabilitySlots");
        if (slots != null)
            profile.setAvailabilitySlots(new HashSet<>(slots));

        // Expert subjects — resolve by name
        @SuppressWarnings("unchecked")
        List<String> subjectNames = (List<String>) updates.get("expertSubjects");
        if (subjectNames != null) {
            Set<Subject> subjects = new HashSet<>();
            for (String name : subjectNames) {
                subjectRepository.findByName(name).ifPresent(subjects::add);
            }
            profile.setExpertSubjects(subjects);
        }

        tutorProfileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
