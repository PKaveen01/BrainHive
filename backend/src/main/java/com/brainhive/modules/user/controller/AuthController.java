package com.brainhive.modules.user.controller;

import com.brainhive.modules.user.dto.*;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.ProfileService;
import com.brainhive.modules.user.service.UserService;
import com.brainhive.modules.user.service.PasswordResetService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest, HttpSession session) {
        LoginResponseDTO response = userService.authenticate(loginRequest, session);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        userService.logout(session);
        return ResponseEntity.ok().body("Logged out successfully");
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpSession session) {
        boolean authenticated = userService.isAuthenticated(session);
        if (authenticated) {
            User user = userService.getCurrentUser(session);
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            String redirect = user.getRole() == UserRole.ADMIN ? "/dashboard/admin"
                    : user.getRole() == UserRole.STUDENT ? "/dashboard/student" : "/dashboard/tutor";
            return ResponseEntity.ok().body(new LoginResponseDTO(
                    true, "Authenticated", redirect,
                    user.getFullName(), user.getEmail(), user.getRole().toString(), user.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegistrationRequest request, HttpSession session) {
        RegistrationResponseDTO response = profileService.registerStudent(request, session);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/register/tutor")
    public ResponseEntity<?> registerTutor(@Valid @RequestBody TutorRegistrationRequest request, HttpSession session) {
        RegistrationResponseDTO response = profileService.registerTutor(request, session);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/complete-profile/student")
    public ResponseEntity<?> completeStudentProfile(@Valid @RequestBody StudentProfileCompletionRequest request, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login first");
        }
        RegistrationResponseDTO response = profileService.completeStudentProfile(userId, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getAllSubjects() {
        return ResponseEntity.ok(profileService.getAllSubjects());
    }

    // ===== PASSWORD RESET ENDPOINTS (from friend's project) =====

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> result = passwordResetService.sendOtp(request.getEmail());
        return (boolean) result.get("success") ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Map<String, Object> result = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
        return (boolean) result.get("success") ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, Object> result = passwordResetService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return (boolean) result.get("success") ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }
}
