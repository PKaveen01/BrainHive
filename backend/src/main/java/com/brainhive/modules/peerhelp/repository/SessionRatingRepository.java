package com.brainhive.modules.peerhelp.repository;

import com.brainhive.modules.peerhelp.model.SessionRating;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRatingRepository extends JpaRepository<SessionRating, Long> {
    
    Optional<SessionRating> findBySession(TutorSession session);
    
    Optional<SessionRating> findBySessionId(Long sessionId);
    
    List<SessionRating> findByTutor(User tutor);
    
    List<SessionRating> findByTutorId(Long tutorId);
    
    List<SessionRating> findByStudent(User student);
    
    List<SessionRating> findByStudentId(Long studentId);
    
    @Query("SELECT AVG(sr.rating) FROM SessionRating sr WHERE sr.tutor.id = :tutorId")
    Double calculateAverageRatingForTutor(@Param("tutorId") Long tutorId);
    
    @Query("SELECT COUNT(sr) FROM SessionRating sr WHERE sr.tutor.id = :tutorId")
    Long countRatingsForTutor(@Param("tutorId") Long tutorId);
    
    @Query("SELECT AVG(sr.knowledgeRating) FROM SessionRating sr WHERE sr.tutor.id = :tutorId")
    Double calculateAverageKnowledgeRating(@Param("tutorId") Long tutorId);
    
    @Query("SELECT AVG(sr.communicationRating) FROM SessionRating sr WHERE sr.tutor.id = :tutorId")
    Double calculateAverageCommunicationRating(@Param("tutorId") Long tutorId);
    
    @Query("SELECT AVG(sr.punctualityRating) FROM SessionRating sr WHERE sr.tutor.id = :tutorId")
    Double calculateAveragePunctualityRating(@Param("tutorId") Long tutorId);
    
    boolean existsBySession(TutorSession session);
}
