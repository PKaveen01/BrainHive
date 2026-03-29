package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.SubjectDTO;
import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.peerhelp.repository.PeerHelpSubjectRepository;

@Service
@Transactional
public class SubjectService {

    @Autowired
    private PeerHelpSubjectRepository subjectRepository;

    /**
     * Get all subjects.
     */
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(SubjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get subject by ID.
     */
    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }

    /**
     * Get subject by name.
     */
    public Optional<Subject> getSubjectByName(String name) {
        return subjectRepository.findByName(name);
    }

    /**
     * Create a new subject.
     */
    public Subject createSubject(String name, String description) {
        if (subjectRepository.existsByName(name)) {
            throw new IllegalArgumentException("Subject with name '" + name + "' already exists");
        }
        Subject subject = new Subject(name, description);
        return subjectRepository.save(subject);
    }

    /**
     * Update an existing subject.
     */
    public Subject updateSubject(Long id, String name, String description) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        if (!subject.getName().equals(name) && subjectRepository.existsByName(name)) {
            throw new IllegalArgumentException("Subject with name '" + name + "' already exists");
        }
        
        subject.setName(name);
        subject.setDescription(description);
        return subjectRepository.save(subject);
    }

    /**
     * Delete a subject.
     */
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Subject not found with ID: " + id);
        }
        subjectRepository.deleteById(id);
    }
}
