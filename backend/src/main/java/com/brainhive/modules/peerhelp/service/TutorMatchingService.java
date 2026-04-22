package com.brainhive.modules.peerhelp.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.TutorProfileResponseDTO;
import com.brainhive.modules.peerhelp.model.TutorAvailability;
import com.brainhive.modules.peerhelp.repository.TutorAvailabilityRepository;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.repository.TutorProfileRepository;

/**
 * Service for matching students with suitable tutors based on subject and availability.
 */
@Service
@Transactional(readOnly = true)
public class TutorMatchingService {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private TutorAvailabilityRepository availabilityRepository;

    /**
     * Find matching tutors for a subject, sorted by credibility score.
     */
    public List<TutorProfileResponseDTO> findMatchingTutors(Long subjectId) {
        return tutorProfileRepository.findAvailableTutorsBySubjectOrderByCredibility(subjectId)
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all approved tutors across all subjects.
     */
    public List<TutorProfileResponseDTO> findAllTutors(int limit) {
        return tutorProfileRepository.findAllApprovedTutorsOrderByCredibility()
                .stream()
                .limit(Math.max(1, limit))
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Find matching tutors for a subject with minimum proficiency level.
     */
    public List<TutorProfileResponseDTO> findQualifiedTutors(Long subjectId, Integer minProficiency) {
        return tutorProfileRepository.findQualifiedTutors(subjectId, minProficiency)
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Find tutors available at a specific date/time for a subject.
     */
    public List<TutorProfileResponseDTO> findAvailableTutorsAtTime(Long subjectId, LocalDateTime dateTime) {
        DayOfWeek dayOfWeek = dateTime.getDayOfWeek();
        LocalTime time = dateTime.toLocalTime();

        List<TutorProfile> subjectTutors = tutorProfileRepository.findAvailableTutorsBySubjectOrderByCredibility(subjectId);

        return subjectTutors.stream()
                .filter(profile -> isTutorAvailableAtTime(profile.getTutor().getId(), dayOfWeek, time))
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Check if a tutor is available at a specific time.
     */
    private boolean isTutorAvailableAtTime(Long tutorId, DayOfWeek dayOfWeek, LocalTime time) {
        List<TutorAvailability> availabilities = availabilityRepository.findByTutorAndDayOfWeek(tutorId, dayOfWeek);
        
        return availabilities.stream()
                .anyMatch(a -> !time.isBefore(a.getStartTime()) && !time.isAfter(a.getEndTime()));
    }

    /**
     * Get the best matching tutor based on credibility and availability.
     */
    public TutorProfileResponseDTO getBestMatch(Long subjectId, LocalDateTime preferredDateTime) {
        List<TutorProfileResponseDTO> matches;
        
        if (preferredDateTime != null) {
            matches = findAvailableTutorsAtTime(subjectId, preferredDateTime);
        } else {
            matches = findMatchingTutors(subjectId);
        }

        return matches.stream()
                .max(Comparator.comparingDouble(TutorProfileResponseDTO::getCredibilityScore))
                .orElse(null);
    }

    /**
     * Calculate match score between a help request and a tutor.
     * Score is based on: proficiency level, credibility score, availability match.
     */
    public double calculateMatchScore(TutorProfile profile, Long requestedSubjectId, LocalDateTime preferredDateTime) {
        double score = 0.0;

        // Subject match (required)
        if (!profile.getSubject().getId().equals(requestedSubjectId)) {
            return 0.0;
        }

        // Proficiency level (20% weight)
        score += (profile.getProficiencyLevel() / 5.0) * 20;

        // Credibility score (50% weight)
        score += (profile.getCredibilityScore() / 5.0) * 50;

        // Availability (30% weight)
        if (preferredDateTime != null) {
            DayOfWeek dayOfWeek = preferredDateTime.getDayOfWeek();
            LocalTime time = preferredDateTime.toLocalTime();
            if (isTutorAvailableAtTime(profile.getTutor().getId(), dayOfWeek, time)) {
                score += 30;
            }
        } else {
            // If no preferred time, give full availability score if tutor is generally available
            if (profile.getIsAvailable()) {
                score += 30;
            }
        }

        return score;
    }

    /**
     * Get top N matching tutors for a request.
     */
    public List<TutorProfileResponseDTO> getTopMatches(Long subjectId, LocalDateTime preferredDateTime, int limit) {
        List<TutorProfile> profiles = tutorProfileRepository.findAvailableTutorsBySubjectOrderByCredibility(subjectId);

        return profiles.stream()
                .sorted((p1, p2) -> {
                    double score1 = calculateMatchScore(p1, subjectId, preferredDateTime);
                    double score2 = calculateMatchScore(p2, subjectId, preferredDateTime);
                    return Double.compare(score2, score1); // Descending order
                })
                .limit(limit)
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
