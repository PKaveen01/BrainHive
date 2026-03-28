package com.brainhive.modules.peerhelp.repository;

import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.peerhelp.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {
    
    Optional<TutorProfile> findByTutor(User tutor);
    
    Optional<TutorProfile> findByTutorId(Long tutorId);
    
    List<TutorProfile> findBySubject(Subject subject);
    
    List<TutorProfile> findBySubjectId(Long subjectId);
    
    List<TutorProfile> findByIsAvailableTrue();
    
    @Query("SELECT tp FROM TutorProfile tp WHERE tp.subject.id = :subjectId AND tp.isAvailable = true ORDER BY tp.credibilityScore DESC")
    List<TutorProfile> findAvailableTutorsBySubjectOrderByCredibility(@Param("subjectId") Long subjectId);
    
    @Query("SELECT tp FROM TutorProfile tp WHERE tp.subject.id = :subjectId AND tp.isAvailable = true AND tp.proficiencyLevel >= :minProficiency ORDER BY tp.credibilityScore DESC")
    List<TutorProfile> findQualifiedTutors(@Param("subjectId") Long subjectId, @Param("minProficiency") Integer minProficiency);
    
    boolean existsByTutor(User tutor);
}
