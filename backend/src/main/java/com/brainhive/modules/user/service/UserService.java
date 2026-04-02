package com.brainhive.modules.user.service;

import com.brainhive.modules.user.dto.LoginRequestDTO;
import com.brainhive.modules.user.dto.LoginResponseDTO;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.TutorProfileRepository;
import com.brainhive.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponseDTO authenticate(LoginRequestDTO loginRequest, HttpSession session) {
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (user == null) {
                return new LoginResponseDTO(false, "User not found", null, null, null, null, null);
            }

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new LoginResponseDTO(false, "Invalid password", null, null, null, null, null);
            }

            // DB is source of truth: if user is ADMIN in DB, allow regardless of frontend role selector
            if (user.getRole() == UserRole.ADMIN) {
                setSession(session, user);
                return new LoginResponseDTO(true, "Login successful", "/dashboard/admin",
                        user.getFullName(), user.getEmail(), "ADMIN", user.getId());
            }

            // For non-admin, verify the role the user selected matches the DB role
            UserRole requestedRole;
            try {
                requestedRole = UserRole.valueOf(loginRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return new LoginResponseDTO(false, "Invalid role", null, null, null, null, null);
            }

            if (!user.getRole().equals(requestedRole)) {
                return new LoginResponseDTO(false, "Invalid role selected for this account", null, null, null, null, null);
            }

            // Tutor approval check: only APPROVED tutors can log in as tutors
            if (user.getRole() == UserRole.TUTOR) {
                TutorProfile tp = tutorProfileRepository.findByUserId(user.getId()).orElse(null);
                if (tp != null) {
                    String status = tp.getVerificationStatus();
                    if ("PENDING".equals(status)) {
                        return new LoginResponseDTO(false,
                                "Your tutor request is pending admin approval. Please check back later.",
                                null, null, null, null, null);
                    } else if ("REJECTED".equals(status)) {
                        return new LoginResponseDTO(false,
                                "Your tutor application has been rejected. Please contact support.",
                                null, null, null, null, null);
                    }
                }
            }

            setSession(session, user);
            String redirectUrl = user.getRole() == UserRole.STUDENT ? "/dashboard/student" : "/dashboard/tutor";
            return new LoginResponseDTO(true, "Login successful", redirectUrl,
                    user.getFullName(), user.getEmail(), user.getRole().toString(), user.getId());

        } catch (Exception e) {
            e.printStackTrace();
            return new LoginResponseDTO(false, "Login failed: " + e.getMessage(), null, null, null, null, null);
        }
    }

    private void setSession(HttpSession session, User user) {
        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userName", user.getFullName());
        session.setAttribute("userRole", user.getRole().toString());
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
