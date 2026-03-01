package com.brainhive.modules.user.service;

import com.brainhive.modules.user.dto.LoginRequestDTO;
import com.brainhive.modules.user.dto.LoginResponseDTO;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest, HttpSession session) {
        try {
            // Find user by email and role
            UserRole role = UserRole.valueOf(loginRequest.getRole().toUpperCase());
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElse(null);

            // Check if user exists
            if (user == null) {
                return new LoginResponseDTO(false, "User not found", null, null, null, null);
            }

            // Check if role matches
            if (!user.getRole().equals(role)) {
                return new LoginResponseDTO(false, "Invalid role selected", null, null, null, null);
            }

            // Check password (plain text for simplicity - in real project, use encryption)
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                return new LoginResponseDTO(false, "Invalid password", null, null, null, null);
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
                    user.getRole().toString()
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
}