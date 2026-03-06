package com.brainhive.modules.user.controller;

import com.brainhive.modules.user.dto.*;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.brainhive.modules.user.service.ProfileService;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest, HttpSession session) {
        System.out.println("=== Login Attempt ===");
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("Role: " + loginRequest.getRole());

        LoginResponseDTO response = userService.authenticate(loginRequest, session);

        if (response.isSuccess()) {
            System.out.println("Login successful, session ID: " + session.getId());
            System.out.println("User ID in session: " + session.getAttribute("userId"));
            return ResponseEntity.ok(response);
        } else {
            System.out.println("Login failed: " + response.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        System.out.println("=== Logout ===");
        System.out.println("Invalidating session: " + session.getId());
        userService.logout(session);
        return ResponseEntity.ok().body("Logged out successfully");
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpSession session) {
        System.out.println("=== Check Auth ===");
        System.out.println("Session ID: " + (session != null ? session.getId() : "null"));
        if (session != null) {
            System.out.println("User ID in session: " + session.getAttribute("userId"));
        }

        boolean authenticated = userService.isAuthenticated(session);
        if (authenticated) {
            User user = userService.getCurrentUser(session);
            return ResponseEntity.ok().body(new LoginResponseDTO(
                    true,
                    "Authenticated",
                    user.getRole() == com.brainhive.modules.user.model.UserRole.STUDENT ? "/dashboard/student" : "/dashboard/tutor",
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().toString(),
                    user.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
    }

    @Autowired
    private ProfileService profileService;

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegistrationRequest request, HttpSession session) {
        System.out.println("=== Register Student Endpoint Called ===");
        RegistrationResponseDTO response = profileService.registerStudent(request, session);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/register/tutor")
    public ResponseEntity<?> registerTutor(@Valid @RequestBody TutorRegistrationRequest request, HttpSession session) {
        System.out.println("=== Register Tutor Endpoint Called ===");
        RegistrationResponseDTO response = profileService.registerTutor(request, session);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/complete-profile/student")
    public ResponseEntity<?> completeStudentProfile(@Valid @RequestBody StudentProfileCompletionRequest request, HttpSession session) {
        System.out.println("=== Complete Profile Endpoint Called ===");
        System.out.println("Session ID: " + session.getId());

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            System.out.println("ERROR: No userId found in session!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login first");
        }

        System.out.println("Completing profile for user ID: " + userId);
        RegistrationResponseDTO response = profileService.completeStudentProfile(userId, request);

        if (response.isSuccess()) {
            System.out.println("Profile completed successfully!");
            return ResponseEntity.ok(response);
        } else {
            System.out.println("Profile completion failed: " + response.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getAllSubjects() {
        return ResponseEntity.ok(profileService.getAllSubjects());
    }
}