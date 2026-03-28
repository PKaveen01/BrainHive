package com.brainhive.modules.user.service;

import com.brainhive.modules.user.dto.*;
import com.brainhive.modules.user.model.*;
import com.brainhive.modules.user.repository.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public RegistrationResponseDTO registerStudent(StudentRegistrationRequest request, HttpSession session) {
        try {
            System.out.println("=== Starting Student Registration ===");
            System.out.println("Email: " + request.getEmail());
            System.out.println("Full Name: " + request.getFullName());
            System.out.println("Session ID before saving: " + session.getId());

            // Validate passwords match
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                System.out.println("Password mismatch");
                return new RegistrationResponseDTO(false, "Passwords do not match", null, false, null);
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                System.out.println("Email already exists: " + request.getEmail());
                return new RegistrationResponseDTO(false, "Email already registered", null, false, null);
            }

            // Create user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setRole(UserRole.STUDENT);
            user = userRepository.save(user);

            System.out.println("User created with ID: " + user.getId());

            // Create student profile
            StudentProfile profile = new StudentProfile(user);
            profile.setProfileCompleted(false);
            profile.setProfileCompletionPercentage(0);
            studentProfileRepository.save(profile);

            System.out.println("Student profile created");

            // AUTO-LOGIN: Create session for the user
            System.out.println("Setting session attributes...");
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userName", user.getFullName());
            session.setAttribute("userRole", user.getRole().toString());

            System.out.println("Session ID after setting attributes: " + session.getId());
            System.out.println("Verifying session attributes:");
            System.out.println("  userId: " + session.getAttribute("userId"));
            System.out.println("  userEmail: " + session.getAttribute("userEmail"));
            System.out.println("  userName: " + session.getAttribute("userName"));
            System.out.println("  userRole: " + session.getAttribute("userRole"));

            return new RegistrationResponseDTO(
                    true,
                    "Student registered successfully",
                    user.getId(),
                    false,
                    "/complete-profile/student"
            );

        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return new RegistrationResponseDTO(false, "Registration failed: " + e.getMessage(), null, false, null);
        }
    }

    @Transactional
    public RegistrationResponseDTO registerTutor(TutorRegistrationRequest request, HttpSession session) {
        try {
            System.out.println("=== Starting Tutor Registration ===");

            // Validate passwords match
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return new RegistrationResponseDTO(false, "Passwords do not match", null, false, null);
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return new RegistrationResponseDTO(false, "Email already registered", null, false, null);
            }

            // Create user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setRole(UserRole.TUTOR);
            user = userRepository.save(user);

            // Create tutor profile
            TutorProfile profile = new TutorProfile(user);
            profile.setQualification(request.getQualification());
            profile.setYearsOfExperience(request.getYearsOfExperience());
            profile.setBio(request.getBio());
            profile.setMaxConcurrentStudents(request.getMaxConcurrentStudents() != null ?
                    request.getMaxConcurrentStudents() : 5);
            profile.setProfileCompleted(true);
            tutorProfileRepository.save(profile);

            // AUTO-LOGIN: Create session for the user
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userName", user.getFullName());
            session.setAttribute("userRole", user.getRole().toString());

            return new RegistrationResponseDTO(
                    true,
                    "Tutor registered successfully. Your account will be reviewed by an admin.",
                    user.getId(),
                    true,
                    "/dashboard/tutor"
            );

        } catch (Exception e) {
            e.printStackTrace();
            return new RegistrationResponseDTO(false, "Registration failed: " + e.getMessage(), null, false, null);
        }
    }

    // NEW METHOD - For profile completion using the new DTO
    @Transactional
    public RegistrationResponseDTO completeStudentProfile(Long userId, StudentProfileCompletionRequest request) {
        try {
            System.out.println("=== Completing Student Profile for User ID: " + userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            StudentProfile profile = studentProfileRepository.findByUser(user)
                    .orElse(new StudentProfile(user));

            // Update profile
            if (request.getDegreeProgram() != null) {
                profile.setDegreeProgram(request.getDegreeProgram());
                System.out.println("Set degree program: " + request.getDegreeProgram());
            }
            if (request.getCurrentYear() != null) {
                profile.setCurrentYear(request.getCurrentYear());
                System.out.println("Set current year: " + request.getCurrentYear());
            }
            if (request.getCurrentSemester() != null) {
                profile.setCurrentSemester(request.getCurrentSemester());
                System.out.println("Set current semester: " + request.getCurrentSemester());
            }
            if (request.getStudyStyle() != null) {
                profile.setStudyStyle(request.getStudyStyle());
                System.out.println("Set study style: " + request.getStudyStyle());
            }
            if (request.getAvailabilityHours() != null) {
                profile.setAvailabilityHours(request.getAvailabilityHours());
                System.out.println("Set availability hours: " + request.getAvailabilityHours());
            }
            if (request.getPreferredTime() != null) {
                profile.setPreferredTime(request.getPreferredTime());
                System.out.println("Set preferred time: " + request.getPreferredTime());
            }

            // Add subjects
            if (request.getSubjects() != null && !request.getSubjects().isEmpty()) {
                System.out.println("Adding subjects: " + request.getSubjects());
                Set<Subject> subjects = new HashSet<>();
                for (String subjectName : request.getSubjects()) {
                    Subject subject = subjectRepository.findByName(subjectName)
                            .orElseGet(() -> {
                                Subject newSubject = new Subject(subjectName, "General");
                                return subjectRepository.save(newSubject);
                            });
                    subjects.add(subject);
                }
                profile.setSubjects(subjects);
            }

            // Set weak subjects - Convert List to Set
            if (request.getWeakSubjects() != null && !request.getWeakSubjects().isEmpty()) {
                Set<String> weakSubjectsSet = new HashSet<>(request.getWeakSubjects());
                profile.setWeakSubjects(weakSubjectsSet);
                System.out.println("Set weak subjects: " + weakSubjectsSet);
            }

            // Calculate completion percentage
            int completion = calculateStudentProfileCompletion(profile);
            profile.setProfileCompletionPercentage(completion);
            profile.setProfileCompleted(completion == 100);

            System.out.println("Profile completion percentage: " + completion + "%");
            System.out.println("Profile completed: " + (completion == 100));

            studentProfileRepository.save(profile);
            System.out.println("Profile saved successfully!");

            return new RegistrationResponseDTO(
                    true,
                    "Profile completed successfully",
                    user.getId(),
                    profile.getProfileCompleted(),
                    "/dashboard/student"
            );

        } catch (Exception e) {
            System.err.println("Profile completion error: " + e.getMessage());
            e.printStackTrace();
            return new RegistrationResponseDTO(false, "Profile completion failed: " + e.getMessage(), null, false, null);
        }
    }

    private int calculateStudentProfileCompletion(StudentProfile profile) {
        int points = 0;
        int total = 5;

        if (profile.getDegreeProgram() != null && !profile.getDegreeProgram().isEmpty()) points++;
        if (profile.getCurrentYear() != null && !profile.getCurrentYear().isEmpty()) points++;
        if (profile.getCurrentSemester() != null && !profile.getCurrentSemester().isEmpty()) points++;
        if (profile.getSubjects() != null && !profile.getSubjects().isEmpty()) points++;
        if (profile.getStudyStyle() != null && !profile.getStudyStyle().isEmpty()) points++;

        return (points * 100) / total;
    }

    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(subject -> new SubjectDTO(subject.getId(), subject.getName(), subject.getCategory()))
                .collect(Collectors.toList());
    }

    public void initializeSubjects() {
        String[] defaultSubjects = {
                "Mathematics", "Physics", "Chemistry", "Biology",
                "Programming", "Data Structures", "Algorithms",
                "Database Systems", "Networks", "AI/ML",
                "Statistics", "English", "Economics", "Business"
        };

        for (String subjectName : defaultSubjects) {
            if (!subjectRepository.existsByName(subjectName)) {
                Subject subject = new Subject(subjectName, "General");
                subjectRepository.save(subject);
            }
        }
    }
}