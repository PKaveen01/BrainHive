package com.brainhive.modules.peerhelp.service;

import com.brainhive.modules.peerhelp.dto.TutorAvailabilityDTO;
import com.brainhive.modules.peerhelp.dto.TutorAvailabilityResponseDTO;
import com.brainhive.modules.peerhelp.model.TutorAvailability;
import com.brainhive.modules.peerhelp.repository.TutorAvailabilityRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TutorAvailabilityService {

    @Autowired
    private TutorAvailabilityRepository availabilityRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Add availability slot for a tutor.
     */
    public TutorAvailabilityResponseDTO addAvailability(Long tutorId, TutorAvailabilityDTO dto) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + tutorId));

        if (tutor.getRole() != UserRole.TUTOR) {
            throw new IllegalArgumentException("User is not a tutor");
        }

        // Validate time range
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        TutorAvailability availability = new TutorAvailability();
        availability.setTutor(tutor);
        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : true);
        availability.setSpecificDate(dto.getSpecificDate());
        availability.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        TutorAvailability saved = availabilityRepository.save(availability);
        return TutorAvailabilityResponseDTO.fromEntity(saved);
    }

    /**
     * Get all availability slots for a tutor.
     */
    public List<TutorAvailabilityResponseDTO> getTutorAvailability(Long tutorId) {
        return availabilityRepository.findByTutorIdAndIsActiveTrue(tutorId)
                .stream()
                .map(TutorAvailabilityResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get availability for a specific day.
     */
    public List<TutorAvailabilityResponseDTO> getAvailabilityByDay(Long tutorId, DayOfWeek dayOfWeek) {
        return availabilityRepository.findByTutorAndDayOfWeek(tutorId, dayOfWeek)
                .stream()
                .map(TutorAvailabilityResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update an availability slot.
     */
    public TutorAvailabilityResponseDTO updateAvailability(Long availabilityId, TutorAvailabilityDTO dto) {
        TutorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));

        // Validate time range
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        
        if (dto.getIsRecurring() != null) {
            availability.setIsRecurring(dto.getIsRecurring());
        }
        if (dto.getSpecificDate() != null) {
            availability.setSpecificDate(dto.getSpecificDate());
        }
        if (dto.getIsActive() != null) {
            availability.setIsActive(dto.getIsActive());
        }

        TutorAvailability saved = availabilityRepository.save(availability);
        return TutorAvailabilityResponseDTO.fromEntity(saved);
    }

    /**
     * Delete an availability slot.
     */
    public void deleteAvailability(Long availabilityId, Long tutorId) {
        TutorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));

        if (!availability.getTutor().getId().equals(tutorId)) {
            throw new IllegalArgumentException("You are not authorized to delete this availability slot");
        }

        availabilityRepository.delete(availability);
    }

    /**
     * Deactivate an availability slot.
     */
    public TutorAvailabilityResponseDTO deactivateAvailability(Long availabilityId, Long tutorId) {
        TutorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));

        if (!availability.getTutor().getId().equals(tutorId)) {
            throw new IllegalArgumentException("You are not authorized to modify this availability slot");
        }

        availability.setIsActive(false);
        TutorAvailability saved = availabilityRepository.save(availability);
        return TutorAvailabilityResponseDTO.fromEntity(saved);
    }

    /**
     * Get tutors available on a specific day.
     */
    public List<User> getAvailableTutorsOnDay(DayOfWeek dayOfWeek) {
        return availabilityRepository.findAvailableTutorsOnDay(dayOfWeek);
    }
}
