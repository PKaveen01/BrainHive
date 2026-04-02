package com.brainhive.modules.user.service;

import com.brainhive.modules.user.dto.LoginRequestDTO;
import com.brainhive.modules.user.dto.LoginResponseDTO;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.brainhive.modules.user.dto.RegistrationResponseDTO;
import com.brainhive.modules.user.dto.StudentRegistrationRequest;
import com.brainhive.modules.user.dto.TutorRegistrationRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest, HttpSession session) {
        try {
            // Find user by email
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElse(null);

            // Check if user exists
            if (user == null) {
                return new LoginResponseDTO(false, "User not found", null, null, null, null);
            }

            // Check if role matches
            UserRole role = UserRole.valueOf(loginRequest.getRole().toUpperCase());
            if (!user.getRole().equals(role)) {
                return new LoginResponseDTO(false, "Invalid role selected", null, null, null, null);
            }

            // FIXED: Use password encoder to check password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new LoginResponseDTO(false, "Invalid password", null, null, null, null);
            }

            // Block PENDING tutors from logging in until admin approves
            if ("PENDING".equals(user.getAccountStatus())) {
                return new LoginResponseDTO(false, "Your tutor account is pending admin approval. Please wait for approval before logging in.", null, null, null, null);
            }

            // Block SUSPENDED accounts
            if ("SUSPENDED".equals(user.getAccountStatus())) {
                return new LoginResponseDTO(false, "Your account has been suspended. Please contact an administrator.", null, null, null, null);
            }

            // Store user in session
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userName", user.getFullName());
            session.setAttribute("userRole", user.getRole().toString());

            // Determine redirect URL based on role
            String redirectUrl = user.getRole() == UserRole.STUDENT ? "/dashboard/student" : "/dashboard/tutor";

            return new LoginResponseDTO(
                    true,
                    "Login successful",
                    redirectUrl,
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().toString(),
                    user.getId()
            );

        } catch (Exception e) {
            e.printStackTrace();
            return new LoginResponseDTO(false, "Login failed: " + e.getMessage(), null, null, null, null);
        }
    }

    public boolean isAuthenticated(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId != null) {
            return userRepository.findById(userId).orElse(null);
        }
        return null;
    }

    // REMOVE these methods from UserService - they should only be in ProfileService
    // to avoid duplication and confusion
}