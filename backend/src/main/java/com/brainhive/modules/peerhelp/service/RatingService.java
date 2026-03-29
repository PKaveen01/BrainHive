package com.brainhive.modules.peerhelp.service;

import com.brainhive.modules.peerhelp.dto.CreateRatingDTO;
import com.brainhive.modules.peerhelp.dto.RatingResponseDTO;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;
import com.brainhive.modules.peerhelp.model.SessionRating;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.SessionRatingRepository;
import com.brainhive.modules.peerhelp.repository.TutorSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RatingService {

    @Autowired
    private SessionRatingRepository ratingRepository;

    @Autowired
    private TutorSessionRepository sessionRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private TutorProfileService tutorProfileService;

    /**
     * Create a rating for a completed session.
     */
    public RatingResponseDTO createRating(Long studentId, CreateRatingDTO dto) {
        TutorSession session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + dto.getSessionId()));

        // Validate that the student is rating their own session
        if (!session.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("You can only rate sessions you participated in as a student");
        }

        // Validate that the session is completed
        if (!session.getIsCompleted()) {
            throw new IllegalArgumentException("Cannot rate an incomplete session");
        }

        // Check if rating already exists
        if (ratingRepository.existsBySession(session)) {
            throw new IllegalArgumentException("Session has already been rated");
        }

        SessionRating rating = new SessionRating();
        rating.setSession(session);
        rating.setStudent(session.getStudent());
        rating.setTutor(session.getTutor());
        rating.setRating(dto.getRating());
        rating.setKnowledgeRating(dto.getKnowledgeRating());
        rating.setCommunicationRating(dto.getCommunicationRating());
        rating.setPunctualityRating(dto.getPunctualityRating());
        rating.setFeedback(dto.getFeedback());
        rating.setWouldRecommend(dto.getWouldRecommend() != null ? dto.getWouldRecommend() : true);

        SessionRating saved = ratingRepository.save(rating);

        // Update help request status to RATED
        HelpRequest request = session.getHelpRequest();
        request.setStatus(HelpRequestStatus.RATED);
        helpRequestRepository.save(request);

        // Update tutor's credibility score
        tutorProfileService.updateCredibilityScore(session.getTutor().getId());

        return RatingResponseDTO.fromEntity(saved);
    }

    /**
     * Get rating by session ID.
     */
    public RatingResponseDTO getRatingBySessionId(Long sessionId) {
        SessionRating rating = ratingRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found for session ID: " + sessionId));
        return RatingResponseDTO.fromEntity(rating);
    }

    /**
     * Get all ratings for a tutor.
     */
    public List<RatingResponseDTO> getTutorRatings(Long tutorId) {
        return ratingRepository.findByTutorId(tutorId)
                .stream()
                .map(RatingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all ratings given by a student.
     */
    public List<RatingResponseDTO> getStudentGivenRatings(Long studentId) {
        return ratingRepository.findByStudentId(studentId)
                .stream()
                .map(RatingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get average rating for a tutor.
     */
    public Double getTutorAverageRating(Long tutorId) {
        Double avg = ratingRepository.calculateAverageRatingForTutor(tutorId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    /**
     * Get rating count for a tutor.
     */
    public Long getTutorRatingCount(Long tutorId) {
        return ratingRepository.countRatingsForTutor(tutorId);
    }

    /**
     * Get detailed rating breakdown for a tutor.
     */
    public TutorRatingBreakdown getTutorRatingBreakdown(Long tutorId) {
        TutorRatingBreakdown breakdown = new TutorRatingBreakdown();
        breakdown.setOverallRating(ratingRepository.calculateAverageRatingForTutor(tutorId));
        breakdown.setKnowledgeRating(ratingRepository.calculateAverageKnowledgeRating(tutorId));
        breakdown.setCommunicationRating(ratingRepository.calculateAverageCommunicationRating(tutorId));
        breakdown.setPunctualityRating(ratingRepository.calculateAveragePunctualityRating(tutorId));
        breakdown.setTotalRatings(ratingRepository.countRatingsForTutor(tutorId));
        return breakdown;
    }

    /**
     * Inner class for rating breakdown.
     */
    public static class TutorRatingBreakdown {
        private Double overallRating;
        private Double knowledgeRating;
        private Double communicationRating;
        private Double punctualityRating;
        private Long totalRatings;

        // Getters and Setters
        public Double getOverallRating() { return overallRating; }
        public void setOverallRating(Double overallRating) { this.overallRating = overallRating; }

        public Double getKnowledgeRating() { return knowledgeRating; }
        public void setKnowledgeRating(Double knowledgeRating) { this.knowledgeRating = knowledgeRating; }

        public Double getCommunicationRating() { return communicationRating; }
        public void setCommunicationRating(Double communicationRating) { this.communicationRating = communicationRating; }

        public Double getPunctualityRating() { return punctualityRating; }
        public void setPunctualityRating(Double punctualityRating) { this.punctualityRating = punctualityRating; }

        public Long getTotalRatings() { return totalRatings; }
        public void setTotalRatings(Long totalRatings) { this.totalRatings = totalRatings; }
    }
}
