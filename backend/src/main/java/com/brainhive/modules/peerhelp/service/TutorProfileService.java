package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.TutorProfileDTO;
import com.brainhive.modules.peerhelp.dto.TutorProfileResponseDTO;
import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.peerhelp.model.TutorProfile;
import com.brainhive.modules.peerhelp.repository.PeerHelpSubjectRepository;
import com.brainhive.modules.peerhelp.repository.PeerHelpTutorProfileRepository;
import com.brainhive.modules.peerhelp.repository.SessionRatingRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;

@Service
@Transactional
public class TutorProfileService {

    @Autowired
    private PeerHelpTutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PeerHelpSubjectRepository subjectRepository;

    @Autowired
    private SessionRatingRepository sessionRatingRepository;

    @Autowired
    private TutorSessionRepository tutorSessionRepository;

    /**
     * Create or update tutor profile.
     */
    public TutorProfileResponseDTO createOrUpdateProfile(Long tutorId, TutorProfileDTO dto) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + tutorId));

        if (tutor.getRole() != UserRole.TUTOR) {
            throw new IllegalArgumentException("User is not a tutor");
        }

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + dto.getSubjectId()));

        TutorProfile profile = tutorProfileRepository.findByTutor(tutor)
                .orElse(new TutorProfile());

        profile.setTutor(tutor);
        profile.setSubject(subject);
        profile.setProficiencyLevel(dto.getProficiencyLevel());
        
        if (dto.getBio() != null) {
            profile.setBio(dto.getBio());
        }
        if (dto.getHourlyRate() != null) {
            profile.setHourlyRate(dto.getHourlyRate());
        }
        if (dto.getIsAvailable() != null) {
            profile.setIsAvailable(dto.getIsAvailable());
        }

        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        return TutorProfileResponseDTO.fromEntity(savedProfile);
    }

    /**
     * Get tutor profile by tutor ID.
     */
    public TutorProfileResponseDTO getProfileByTutorId(Long tutorId) {
        TutorProfile profile = tutorProfileRepository.findByTutorId(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found for user ID: " + tutorId));
        return TutorProfileResponseDTO.fromEntity(profile);
    }

    /**
     * Get all available tutors for a subject.
     */
    public List<TutorProfileResponseDTO> getAvailableTutorsBySubject(Long subjectId) {
        return tutorProfileRepository.findAvailableTutorsBySubjectOrderByCredibility(subjectId)
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get qualified tutors with minimum proficiency.
     */
    public List<TutorProfileResponseDTO> getQualifiedTutors(Long subjectId, Integer minProficiency) {
        return tutorProfileRepository.findQualifiedTutors(subjectId, minProficiency)
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update tutor's availability status.
     */
    public TutorProfileResponseDTO updateAvailability(Long tutorId, Boolean isAvailable) {
        TutorProfile profile = tutorProfileRepository.findByTutorId(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found for user ID: " + tutorId));
        
        profile.setIsAvailable(isAvailable);
        TutorProfile savedProfile = tutorProfileRepository.save(profile);
        return TutorProfileResponseDTO.fromEntity(savedProfile);
    }

    /**
     * Update tutor's credibility score based on ratings and sessions.
     */
    public void updateCredibilityScore(Long tutorId) {
        TutorProfile profile = tutorProfileRepository.findByTutorId(tutorId)
                .orElse(null);
        
        if (profile != null) {
            Double avgRating = sessionRatingRepository.calculateAverageRatingForTutor(tutorId);
            Long totalSessions = tutorSessionRepository.countCompletedSessionsByTutor(tutorId);

            profile.setAverageRating(avgRating != null ? avgRating : 0.0);
            profile.setTotalSessions(totalSessions != null ? totalSessions.intValue() : 0);
            profile.calculateCredibilityScore();
            
            tutorProfileRepository.save(profile);
        }
    }

    /**
     * Get all tutor profiles.
     */
    public List<TutorProfileResponseDTO> getAllProfiles() {
        return tutorProfileRepository.findAll()
                .stream()
                .map(TutorProfileResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
