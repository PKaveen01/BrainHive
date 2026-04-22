package com.brainhive.modules.user.service;

import com.brainhive.modules.user.model.PasswordResetOtp;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.repository.PasswordResetOtpRepository;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public Map<String, Object> sendOtp(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "No account found with this email address.");
        }

        // Delete any old OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        PasswordResetOtp resetOtp = new PasswordResetOtp(email, otp);
        otpRepository.save(resetOtp);

        // Send email
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("BrainHive - Password Reset OTP");
                message.setText("Hello " + user.getFullName() + ",\n\n"
                        + "Your password reset OTP is: " + otp + "\n\n"
                        + "This code is valid for 10 minutes.\n\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "BrainHive Team");
                mailSender.send(message);
                return Map.of("success", true, "message", "OTP sent to " + email);
            } else {
                // Dev mode - log OTP to console
                System.out.println("===== DEV MODE OTP =====");
                System.out.println("Email: " + email);
                System.out.println("OTP: " + otp);
                System.out.println("========================");
                return Map.of("success", true, "message", "OTP sent to " + email + " (check server console in dev mode)");
            }
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            System.out.println("OTP for " + email + " : " + otp);
            return Map.of("success", true, "message", "OTP sent to " + email);
        }
    }

    public Map<String, Object> verifyOtp(String email, String otp) {
        PasswordResetOtp saved = otpRepository.findTopByEmailOrderByCreatedAtDesc(email).orElse(null);
        if (saved == null || saved.isUsed()) {
            return Map.of("success", false, "message", "No valid OTP found. Please request a new one.");
        }
        if (LocalDateTime.now().isAfter(saved.getExpiresAt())) {
            return Map.of("success", false, "message", "OTP has expired. Please request a new one.");
        }
        if (!saved.getOtp().equals(otp)) {
            return Map.of("success", false, "message", "Incorrect OTP. Please try again.");
        }
        return Map.of("success", true, "message", "OTP verified successfully.");
    }

    @Transactional
    public Map<String, Object> resetPassword(String email, String otp, String newPassword) {
        // Re-verify OTP
        Map<String, Object> verifyResult = verifyOtp(email, otp);
        if (!(boolean) verifyResult.get("success")) {
            return verifyResult;
        }
        if (newPassword == null || newPassword.length() < 6) {
            return Map.of("success", false, "message", "Password must be at least 6 characters.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "User not found.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used
        PasswordResetOtp saved = otpRepository.findTopByEmailOrderByCreatedAtDesc(email).orElse(null);
        if (saved != null) {
            saved.setUsed(true);
            otpRepository.save(saved);
        }

        return Map.of("success", true, "message", "Password reset successfully. You can now log in.");
    }
}
