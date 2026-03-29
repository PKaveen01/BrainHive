package com.brainhive.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.peerhelp.repository.PeerHelpSubjectRepository;

@Component
public class SubjectDataInitializer implements CommandLineRunner {

    private final PeerHelpSubjectRepository subjectRepository;

    public SubjectDataInitializer(PeerHelpSubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public void run(String... args) {
        List<SubjectSeed> subjects = List.of(
                new SubjectSeed("Introduction to Programming", "Programming fundamentals with problem-solving techniques."),
                new SubjectSeed("Data Structures and Algorithms", "Core data structures, algorithm design, and complexity analysis."),
                new SubjectSeed("Database Management Systems", "Relational databases, SQL queries, and schema design."),
                new SubjectSeed("Operating Systems", "Processes, memory management, scheduling, and file systems."),
                new SubjectSeed("Computer Networks", "Network layers, protocols, routing, and TCP/IP fundamentals."),
                new SubjectSeed("Web Development", "Frontend and backend web technologies for modern applications."),
                new SubjectSeed("Object-Oriented Programming in Java", "OOP concepts and practical Java application design."),
                new SubjectSeed("Software Engineering", "Requirements, architecture, testing, and agile development practices."),
                new SubjectSeed("Cloud Computing", "Cloud service models, deployment, scalability, and basic DevOps."),
                new SubjectSeed("Cybersecurity Fundamentals", "Security principles, threats, authentication, and secure coding basics.")
        );

        for (SubjectSeed seed : subjects) {
            if (!subjectRepository.existsByName(seed.name())) {
                subjectRepository.save(new Subject(seed.name(), seed.description()));
            }
        }
    }

    private record SubjectSeed(String name, String description) {}
}
