package com.brainhive.modules.user.controller;

import com.brainhive.modules.user.dto.LoginRequestDTO;
import com.brainhive.modules.user.dto.LoginResponseDTO;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

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
            return ResponseEntity.ok().body(new LoginResponseDTO(
                    true,
                    "Authenticated",
                    user.getRole() == com.brainhive.modules.user.model.UserRole.STUDENT ? "/dashboard/student" : "/dashboard/tutor",
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().toString()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
    }
}