package com.brainhive.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.repository.SubjectRepository;

@Component
public class SubjectDataInitializer implements CommandLineRunner {

    private final SubjectRepository subjectRepository;

    public SubjectDataInitializer(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public void run(String... args) {
        List<SubjectSeed> subjects = List.of(
                new SubjectSeed("Introduction to Programming", "Programming fundamentals with problem-solving techniques.", "Programming"),
                new SubjectSeed("Data Structures and Algorithms", "Core data structures, algorithm design, and complexity analysis.", "Programming"),
                new SubjectSeed("Database Management Systems", "Relational databases, SQL queries, and schema design.", "Programming"),
                new SubjectSeed("Operating Systems", "Processes, memory management, scheduling, and file systems.", "Systems"),
                new SubjectSeed("Computer Networks", "Network layers, protocols, routing, and TCP/IP fundamentals.", "Systems"),
                new SubjectSeed("Web Development", "Frontend and backend web technologies for modern applications.", "Programming"),
                new SubjectSeed("Object-Oriented Programming in Java", "OOP concepts and practical Java application design.", "Programming"),
                new SubjectSeed("Software Engineering", "Requirements, architecture, testing, and agile development practices.", "Engineering"),
                new SubjectSeed("Cloud Computing", "Cloud service models, deployment, scalability, and basic DevOps.", "Systems"),
                new SubjectSeed("Cybersecurity Fundamentals", "Security principles, threats, authentication, and secure coding basics.", "Security")
        );

        for (SubjectSeed seed : subjects) {
            if (!subjectRepository.existsByName(seed.name())) {
                Subject subject = new Subject(seed.name(), seed.category());
                subject.setDescription(seed.description());
                subjectRepository.save(subject);
            }
        }
    }

    private record SubjectSeed(String name, String description, String category) {}
}
