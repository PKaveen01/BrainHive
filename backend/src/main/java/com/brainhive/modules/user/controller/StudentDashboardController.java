package com.brainhive.modules.user.controller;

import com.brainhive.modules.collaboration.model.GroupMember;
import com.brainhive.modules.collaboration.model.StudyGroup;
import com.brainhive.modules.collaboration.repository.GroupMemberRepository;
import com.brainhive.modules.collaboration.repository.StudyGroupRepository;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.resources.model.Resource;
import com.brainhive.modules.resources.model.ResourceBookmark;
import com.brainhive.modules.resources.repository.ResourceBookmarkRepository;
import com.brainhive.modules.user.model.StudentProfile;
import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.StudentProfileRepository;
import com.brainhive.modules.user.repository.SubjectRepository;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/student")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentDashboardController {

    @Autowired private UserService userService;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private HelpRequestRepository helpRequestRepository;
    @Autowired private TutorSessionRepository tutorSessionRepository;
    @Autowired private ResourceBookmarkRepository resourceBookmarkRepository;
    @Autowired private StudyGroupRepository studyGroupRepository;
    @Autowired private GroupMemberRepository groupMemberRepository;

    // ─── helper ──────────────────────────────────────────────────────────────
    private User getStudentOrNull(HttpSession session) {
        if (!userService.isAuthenticated(session)) return null;
        User u = userService.getCurrentUser(session);
        return (u != null && u.getRole() == UserRole.STUDENT) ? u : null;
    }

    // ─── /info (unchanged, kept for backward compat) ─────────────────────────
    @GetMapping("/info")
    public ResponseEntity<?> getStudentInfo(HttpSession session) {
        User user = getStudentOrNull(session);
        if (user == null) return ResponseEntity.status(401).body("Not authenticated or access denied");

        Map<String, Object> data = new HashMap<>();
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());

        studentProfileRepository.findByUserIdWithCollections(user.getId()).ifPresent(profile -> {
            data.put("program", profile.getDegreeProgram() != null ? profile.getDegreeProgram() : "");
            data.put("year", profile.getCurrentYear() != null ? profile.getCurrentYear() : "");
            data.put("semester", profile.getCurrentSemester() != null ? profile.getCurrentSemester() : "");
            data.put("studyStyle", profile.getStudyStyle() != null ? profile.getStudyStyle() : "");
            data.put("availabilityHours", profile.getAvailabilityHours() != null ? profile.getAvailabilityHours() : 3);
            data.put("preferredTime", profile.getPreferredTime() != null ? profile.getPreferredTime() : "");
            data.put("profileCompletion", profile.getProfileCompletionPercentage() != null ? profile.getProfileCompletionPercentage() : 0);
            data.put("profileCompleted", profile.getProfileCompleted() != null ? profile.getProfileCompleted() : false);

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

            if (profile.getWeakSubjects() != null)
                data.put("weakSubjects", new ArrayList<>(profile.getWeakSubjects()));
        });

        Map<String, Object> stats = new HashMap<>();
        stats.put("helpSessions", tutorSessionRepository.findByStudentId(user.getId()).size());
        stats.put("resourcesSaved", resourceBookmarkRepository.countByUserId(user.getId()));
        stats.put("studyStreak", 1);
        data.put("stats", stats);

        return ResponseEntity.ok(data);
    }

    // ─── Helper: generate ordered list of last N month labels ────────────────
    private List<String> lastNMonths(int n) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yy");
        List<String> months = new ArrayList<>();
        java.time.LocalDate cursor = java.time.LocalDate.now().withDayOfMonth(1);
        for (int i = n - 1; i >= 0; i--) {
            months.add(cursor.minusMonths(i).format(fmt));
        }
        return months;
    }

    // ─── NEW: /analytics  ─────────────────────────────────────────────────────
    /**
     * Returns all chart data the student dashboard needs in a single call:
     *   - resourcesBySubject   (bar)
     *   - resourcesByType      (pie)
     *   - bookmarksOverTime    (line/area)
     *   - helpRequestsByStatus (donut)
     *   - helpRequestsBySubject(bar)
     *   - sessionsOverTime     (area)
     *   - groupSummary         (stat cards)
     *   - activityTimeline     (combined bar: resources added, sessions, groups joined per month)
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getStudentAnalytics(HttpSession session) {
        User user = getStudentOrNull(session);
        if (user == null) return ResponseEntity.status(401).body("Not authenticated or access denied");

        Map<String, Object> result = new HashMap<>();

        // ── 1. Bookmarked resources breakdown ─────────────────────────────────
        List<ResourceBookmark> bookmarks = resourceBookmarkRepository.findByUserId(user.getId());

        // By subject
        Map<String, Long> bySubject = bookmarks.stream()
                .filter(b -> b.getResource() != null && b.getResource().getSubject() != null)
                .collect(Collectors.groupingBy(b -> b.getResource().getSubject(), Collectors.counting()));
        List<Map<String, Object>> resourcesBySubject = bySubject.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("name", e.getKey()); m.put("count", e.getValue()); return m; })
                .collect(Collectors.toList());
        result.put("resourcesBySubject", resourcesBySubject);

        // By type
        Map<String, Long> byType = bookmarks.stream()
                .filter(b -> b.getResource() != null && b.getResource().getType() != null)
                .collect(Collectors.groupingBy(b -> b.getResource().getType(), Collectors.counting()));
        List<Map<String, Object>> resourcesByType = byType.entrySet().stream()
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("name", e.getKey()); m.put("value", e.getValue()); return m; })
                .collect(Collectors.toList());
        result.put("resourcesByType", resourcesByType);

        // Bookmarks added over time — always last 6 months, zero-padded
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yy");
        List<String> last6 = lastNMonths(6);
        Map<String, Long> bookmarksRaw = new HashMap<>();
        bookmarks.stream()
                .filter(b -> b.getBookmarkedAt() != null)
                .forEach(b -> bookmarksRaw.merge(b.getBookmarkedAt().format(monthFmt), 1L, Long::sum));
        List<Map<String, Object>> bookmarksOverTime = last6.stream()
                .map(mo -> { Map<String, Object> m = new HashMap<>(); m.put("month", mo); m.put("bookmarks", bookmarksRaw.getOrDefault(mo, 0L)); return m; })
                .collect(Collectors.toList());
        result.put("bookmarksOverTime", bookmarksOverTime);

        // ── 2. Help Requests breakdown ─────────────────────────────────────────
        List<HelpRequest> requests = helpRequestRepository.findByStudentId(user.getId());

        // By status
        Map<String, Long> byStatus = requests.stream()
                .filter(r -> r.getStatus() != null)
                .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
        List<Map<String, Object>> helpRequestsByStatus = byStatus.entrySet().stream()
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("name", e.getKey()); m.put("value", e.getValue()); return m; })
                .collect(Collectors.toList());
        result.put("helpRequestsByStatus", helpRequestsByStatus);

        // By subject
        Map<String, Long> byReqSubject = requests.stream()
                .filter(r -> r.getSubject() != null && r.getSubject().getName() != null)
                .collect(Collectors.groupingBy(r -> r.getSubject().getName(), Collectors.counting()));
        List<Map<String, Object>> helpRequestsBySubject = byReqSubject.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("subject", e.getKey()); m.put("requests", e.getValue()); return m; })
                .collect(Collectors.toList());
        result.put("helpRequestsBySubject", helpRequestsBySubject);

        // ── 3. Tutor Sessions breakdown ────────────────────────────────────────
        List<TutorSession> sessions = tutorSessionRepository.findByStudentId(user.getId());

        // Sessions over time — always last 6 months, zero-padded
        Map<String, Long> sessionsRaw = new HashMap<>();
        sessions.stream()
                .filter(s -> s.getCreatedAt() != null)
                .forEach(s -> sessionsRaw.merge(s.getCreatedAt().format(monthFmt), 1L, Long::sum));
        List<Map<String, Object>> sessionsOverTime = last6.stream()
                .map(mo -> { Map<String, Object> m = new HashMap<>(); m.put("month", mo); m.put("sessions", sessionsRaw.getOrDefault(mo, 0L)); return m; })
                .collect(Collectors.toList());
        result.put("sessionsOverTime", sessionsOverTime);

        long completedSessions = sessions.stream().filter(s -> Boolean.TRUE.equals(s.getIsCompleted())).count();
        long pendingSessions   = sessions.size() - completedSessions;
        result.put("sessionCompletionStats", Map.of(
                "completed", completedSessions,
                "pending", pendingSessions,
                "total", sessions.size()
        ));

        // ── 4. Study Groups ────────────────────────────────────────────────────
        List<StudyGroup> groups = studyGroupRepository.findGroupsByMember(user);
        List<Map<String, Object>> groupSummary = groups.stream()
                .map(g -> {
                    Map<String, Object> gm = new HashMap<>();
                    gm.put("id", g.getId());
                    gm.put("name", g.getName());
                    gm.put("subject", g.getSubject() != null ? g.getSubject() : "General");
                    gm.put("memberCount", groupMemberRepository.countByGroup(g));
                    gm.put("isActive", g.getIsActive());
                    gm.put("createdAt", g.getCreatedAt() != null ? g.getCreatedAt().format(monthFmt) : "");
                    return gm;
                }).collect(Collectors.toList());
        result.put("groupSummary", groupSummary);
        result.put("totalGroups", groups.size());

        // Groups by subject (for pie chart)
        Map<String, Long> groupsBySubject = groups.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getSubject() != null ? g.getSubject() : "General",
                        Collectors.counting()));
        List<Map<String, Object>> groupsBySubjectList = groupsBySubject.entrySet().stream()
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("name", e.getKey()); m.put("value", e.getValue()); return m; })
                .collect(Collectors.toList());
        result.put("groupsBySubject", groupsBySubjectList);

        // ── 5. Combined activity timeline — always last 6 months, zero-padded ──
        Map<String, Map<String, Object>> timelineRaw = new HashMap<>();
        bookmarks.stream().filter(b -> b.getBookmarkedAt() != null).forEach(b -> {
            String key = b.getBookmarkedAt().format(monthFmt);
            timelineRaw.computeIfAbsent(key, k -> new HashMap<>(Map.of("month", k, "bookmarks", 0L, "sessions", 0L, "requests", 0L)));
            timelineRaw.get(key).merge("bookmarks", 1L, (a, b2) -> (Long) a + (Long) b2);
        });
        sessions.stream().filter(s -> s.getCreatedAt() != null).forEach(s -> {
            String key = s.getCreatedAt().format(monthFmt);
            timelineRaw.computeIfAbsent(key, k -> new HashMap<>(Map.of("month", k, "bookmarks", 0L, "sessions", 0L, "requests", 0L)));
            timelineRaw.get(key).merge("sessions", 1L, (a, b2) -> (Long) a + (Long) b2);
        });
        requests.stream().filter(r -> r.getCreatedAt() != null).forEach(r -> {
            String key = r.getCreatedAt().format(monthFmt);
            timelineRaw.computeIfAbsent(key, k -> new HashMap<>(Map.of("month", k, "bookmarks", 0L, "sessions", 0L, "requests", 0L)));
            timelineRaw.get(key).merge("requests", 1L, (a, b2) -> (Long) a + (Long) b2);
        });
        List<Map<String, Object>> activityTimeline = last6.stream()
                .map(mo -> timelineRaw.getOrDefault(mo,
                        new HashMap<>(Map.of("month", mo, "bookmarks", 0L, "sessions", 0L, "requests", 0L))))
                .collect(Collectors.toList());
        result.put("activityTimeline", activityTimeline);

        // ── 6. Summary stats ──────────────────────────────────────────────────
        result.put("totalBookmarks", bookmarks.size());
        result.put("totalRequests", requests.size());
        result.put("totalSessions", sessions.size());

        return ResponseEntity.ok(result);
    }

    // ─── /profile POST (unchanged) ────────────────────────────────────────────
    @PostMapping("/profile")
    public ResponseEntity<?> updateStudentProfile(@RequestBody Map<String, Object> updates, HttpSession session) {
        if (!userService.isAuthenticated(session))
            return ResponseEntity.status(401).body("Not authenticated");

        User user = userService.getCurrentUser(session);
        if (user == null || user.getRole() != UserRole.STUDENT)
            return ResponseEntity.status(403).body("Access denied");

        StudentProfile profile = studentProfileRepository.findByUserIdWithCollections(user.getId())
                .orElse(new StudentProfile(user));

        if (updates.containsKey("degreeProgram")) profile.setDegreeProgram((String) updates.get("degreeProgram"));
        if (updates.containsKey("currentYear")) profile.setCurrentYear((String) updates.get("currentYear"));
        if (updates.containsKey("currentSemester")) profile.setCurrentSemester((String) updates.get("currentSemester"));
        if (updates.containsKey("studyStyle")) profile.setStudyStyle((String) updates.get("studyStyle"));
        if (updates.containsKey("preferredTime")) profile.setPreferredTime((String) updates.get("preferredTime"));

        if (updates.containsKey("availabilityHours")) {
            Object ah = updates.get("availabilityHours");
            if (ah instanceof Integer) profile.setAvailabilityHours((Integer) ah);
            else if (ah instanceof Number) profile.setAvailabilityHours(((Number) ah).intValue());
            else if (ah instanceof String) {
                try { profile.setAvailabilityHours(Integer.parseInt((String) ah)); } catch (Exception ignored) {}
            }
        }

        @SuppressWarnings("unchecked")
        List<String> subjectNames = (List<String>) updates.get("subjectsFollowing");
        if (subjectNames != null) {
            Set<Subject> resolved = new HashSet<>();
            for (String name : subjectNames) {
                subjectRepository.findByName(name).ifPresent(resolved::add);
            }
            profile.setSubjects(resolved);
        }

        @SuppressWarnings("unchecked")
        List<String> weakSubjects = (List<String>) updates.get("weakSubjects");
        if (weakSubjects != null) profile.setWeakSubjects(new HashSet<>(weakSubjects));

        int pts = 0;
        if (profile.getDegreeProgram() != null && !profile.getDegreeProgram().isEmpty()) pts++;
        if (profile.getCurrentYear() != null && !profile.getCurrentYear().isEmpty()) pts++;
        if (profile.getCurrentSemester() != null && !profile.getCurrentSemester().isEmpty()) pts++;
        if (profile.getSubjects() != null && !profile.getSubjects().isEmpty()) pts++;
        if (profile.getStudyStyle() != null && !profile.getStudyStyle().isEmpty()) pts++;
        if (profile.getPreferredTime() != null && !profile.getPreferredTime().isEmpty()) pts++;
        profile.setProfileCompletionPercentage((int) Math.round((pts / 6.0) * 100));
        profile.setProfileCompleted(pts == 6);

        studentProfileRepository.save(profile);
        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "profileCompletion", profile.getProfileCompletionPercentage()
        ));
    }
}