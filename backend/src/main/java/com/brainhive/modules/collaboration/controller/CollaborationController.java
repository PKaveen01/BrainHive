package com.brainhive.modules.collaboration.controller;

import com.brainhive.modules.collaboration.dto.CollaborationDTOs.*;
import com.brainhive.modules.collaboration.service.CollaborationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/collaboration")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CollaborationController {

    @Autowired
    private CollaborationService collaborationService;

    private Long getUserId(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Not authenticated");
        return userId;
    }

    // ==================== GROUPS ====================

    @PostMapping("/groups")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.createGroup(userId, req));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Not authenticated"))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/groups/join")
    public ResponseEntity<?> joinGroup(@RequestBody JoinGroupRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.joinGroup(userId, req));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Not authenticated"))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getMyGroups(HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.getMyGroups(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable Long groupId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.getGroupById(groupId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/groups/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            collaborationService.leaveGroup(groupId, userId);
            return ResponseEntity.ok(Map.of("message", "Left group successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/groups/{groupId}/members/{targetUserId}")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @PathVariable Long targetUserId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            collaborationService.removeMember(groupId, targetUserId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== MESSAGES ====================

    @PostMapping("/groups/{groupId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long groupId, @RequestBody SendMessageRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.sendMessage(groupId, userId, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/groups/{groupId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long groupId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.getMessages(groupId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== TASKS ====================

    @PostMapping("/groups/{groupId}/tasks")
    public ResponseEntity<?> createTask(@PathVariable Long groupId, @RequestBody CreateTaskRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.createTask(groupId, userId, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @RequestBody UpdateTaskStatusRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.updateTaskStatus(taskId, userId, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/groups/{groupId}/tasks")
    public ResponseEntity<?> getGroupTasks(@PathVariable Long groupId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.getGroupTasks(groupId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== EVENTS ====================

    @PostMapping("/groups/{groupId}/events")
    public ResponseEntity<?> createEvent(@PathVariable Long groupId, @RequestBody CreateEventRequest req, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.createEvent(groupId, userId, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/groups/{groupId}/events")
    public ResponseEntity<?> getGroupEvents(@PathVariable Long groupId, HttpSession session) {
        try {
            Long userId = getUserId(session);
            return ResponseEntity.ok(collaborationService.getGroupEvents(groupId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
