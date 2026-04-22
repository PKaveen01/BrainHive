package com.brainhive.config;

import com.brainhive.modules.user.model.*;
import com.brainhive.modules.user.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seeds test users and subjects on startup if they don't already exist.
 * Safe to run multiple times (idempotent checks on email).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private TutorProfileRepository tutorProfileRepository;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private SubjectRepository subjectRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        seedSubjects();
        seedAdmin();
        seedStudents();
        seedTutors();
        System.out.println("=== DataInitializer: Seed complete ===");
    }

    private void seedSubjects() {
        String[] names = {
            "Mathematics", "Physics", "Chemistry", "Biology",
            "Data Structures", "Algorithms", "Database Systems",
            "Computer Networks", "Operating Systems", "Software Engineering",
            "Artificial Intelligence", "Machine Learning", "Web Development",
            "Programming (Java)", "Programming (Python)", "Statistics",
            "Discrete Mathematics", "Computer Architecture", "Cyber Security",
            "Cloud Computing", "Mobile Development", "English", "Economics"
        };
        for (String name : names) {
            if (!subjectRepository.existsByName(name)) {
                subjectRepository.save(new Subject(name, "General"));
            }
        }
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@brainhive.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@brainhive.com");
            admin.setPassword(encoder.encode("Admin123"));
            admin.setFullName("Admin User");
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("  [SEED] Admin created: admin@brainhive.com / Admin123");
        }
    }

    private void seedStudents() {
        // Student 1 – complete profile, has weak areas
        if (userRepository.findByEmail("student@test.com").isEmpty()) {
            User u = new User();
            u.setEmail("student@test.com");
            u.setPassword(encoder.encode("Student123"));
            u.setFullName("Alice Student");
            u.setRole(UserRole.STUDENT);
            u = userRepository.save(u);

            StudentProfile sp = new StudentProfile(u);
            sp.setDegreeProgram("BSc Computer Science");
            sp.setCurrentYear("Year 2");
            sp.setCurrentSemester("Semester 1");
            sp.setStudyStyle("Group");
            sp.setAvailabilityHours(4);
            sp.setPreferredTime("Evening");
            sp.setProfileCompleted(true);
            sp.setProfileCompletionPercentage(100);

            // Subjects
            Set<Subject> subjects = new HashSet<>();
            subjectRepository.findByName("Data Structures").ifPresent(subjects::add);
            subjectRepository.findByName("Algorithms").ifPresent(subjects::add);
            subjectRepository.findByName("Database Systems").ifPresent(subjects::add);
            sp.setSubjects(subjects);

            // Weak areas for personalized discovery
            Set<String> weakAreas = new HashSet<>(Arrays.asList("Algorithms", "Operating Systems"));
            sp.setWeakSubjects(weakAreas);

            studentProfileRepository.save(sp);
            System.out.println("  [SEED] Student created: student@test.com / Student123");
        }

        // Student 2
        if (userRepository.findByEmail("student2@test.com").isEmpty()) {
            User u = new User();
            u.setEmail("student2@test.com");
            u.setPassword(encoder.encode("Student123"));
            u.setFullName("Bob Student");
            u.setRole(UserRole.STUDENT);
            u = userRepository.save(u);

            StudentProfile sp = new StudentProfile(u);
            sp.setDegreeProgram("BEng Software Engineering");
            sp.setCurrentYear("Year 3");
            sp.setCurrentSemester("Semester 2");
            sp.setStudyStyle("Solo");
            sp.setAvailabilityHours(3);
            sp.setProfileCompleted(true);
            sp.setProfileCompletionPercentage(80);

            Set<Subject> subjects = new HashSet<>();
            subjectRepository.findByName("Web Development").ifPresent(subjects::add);
            subjectRepository.findByName("Machine Learning").ifPresent(subjects::add);
            sp.setSubjects(subjects);

            Set<String> weakAreas = new HashSet<>(Arrays.asList("Machine Learning", "Statistics"));
            sp.setWeakSubjects(weakAreas);

            studentProfileRepository.save(sp);
            System.out.println("  [SEED] Student 2 created: student2@test.com / Student123");
        }
    }

    private void seedTutors() {
        // Approved tutor
        if (userRepository.findByEmail("tutor@test.com").isEmpty()) {
            User u = new User();
            u.setEmail("tutor@test.com");
            u.setPassword(encoder.encode("Tutor123"));
            u.setFullName("Dr. John Tutor");
            u.setRole(UserRole.TUTOR);
            u = userRepository.save(u);

            TutorProfile tp = new TutorProfile(u);
            tp.setQualification("PhD Computer Science");
            tp.setYearsOfExperience(5);
            tp.setBio("Experienced CS tutor specialising in Data Structures and Algorithms.");
            tp.setVerificationStatus("APPROVED");
            tp.setProfileCompleted(true);
            tp.setIsAvailable(true);
            tp.setProficiencyLevel(5);
            tp.setAverageRating(4.8);
            tp.setTotalSessions(42);
            tp.setCredibilityScore(4.5);

            subjectRepository.findByName("Data Structures").ifPresent(tp::setSubject);

            Set<Subject> expertSubjects = new HashSet<>();
            subjectRepository.findByName("Data Structures").ifPresent(expertSubjects::add);
            subjectRepository.findByName("Algorithms").ifPresent(expertSubjects::add);
            tp.setExpertSubjects(expertSubjects);

            tutorProfileRepository.save(tp);
            System.out.println("  [SEED] Approved Tutor created: tutor@test.com / Tutor123");
        }

        // Pending tutor
        if (userRepository.findByEmail("pending@test.com").isEmpty()) {
            User u = new User();
            u.setEmail("pending@test.com");
            u.setPassword(encoder.encode("Tutor123"));
            u.setFullName("Jane Pending");
            u.setRole(UserRole.TUTOR);
            u = userRepository.save(u);

            TutorProfile tp = new TutorProfile(u);
            tp.setQualification("MSc Mathematics");
            tp.setYearsOfExperience(2);
            tp.setBio("Passionate about teaching mathematics.");
            tp.setVerificationStatus("PENDING");
            tp.setProfileCompleted(true);
            tp.setIsAvailable(false);
            tp.setProficiencyLevel(4);

            subjectRepository.findByName("Mathematics").ifPresent(tp::setSubject);

            tutorProfileRepository.save(tp);
            System.out.println("  [SEED] Pending Tutor created: pending@test.com / Tutor123");
        }

        // Second approved tutor
        if (userRepository.findByEmail("tutor2@test.com").isEmpty()) {
            User u = new User();
            u.setEmail("tutor2@test.com");
            u.setPassword(encoder.encode("Tutor123"));
            u.setFullName("Prof. Sarah Tech");
            u.setRole(UserRole.TUTOR);
            u = userRepository.save(u);

            TutorProfile tp = new TutorProfile(u);
            tp.setQualification("MSc Artificial Intelligence");
            tp.setYearsOfExperience(3);
            tp.setBio("AI/ML specialist with strong background in statistics.");
            tp.setVerificationStatus("APPROVED");
            tp.setProfileCompleted(true);
            tp.setIsAvailable(true);
            tp.setProficiencyLevel(4);
            tp.setAverageRating(4.5);
            tp.setTotalSessions(18);
            tp.setCredibilityScore(4.0);

            subjectRepository.findByName("Machine Learning").ifPresent(tp::setSubject);

            Set<Subject> expertSubjects = new HashSet<>();
            subjectRepository.findByName("Machine Learning").ifPresent(expertSubjects::add);
            subjectRepository.findByName("Statistics").ifPresent(expertSubjects::add);
            subjectRepository.findByName("Artificial Intelligence").ifPresent(expertSubjects::add);
            tp.setExpertSubjects(expertSubjects);

            tutorProfileRepository.save(tp);
            System.out.println("  [SEED] Approved Tutor 2 created: tutor2@test.com / Tutor123");
        }
    }
}
