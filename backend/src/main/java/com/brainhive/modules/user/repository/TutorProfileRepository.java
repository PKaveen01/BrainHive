package com.brainhive.modules.user.repository;

import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.model.TutorProfile;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {

    Optional<TutorProfile> findByUser(User user);
    Optional<TutorProfile> findByUserId(Long userId);

    default Optional<TutorProfile> findByTutor(User tutor) { return findByUser(tutor); }
    default Optional<TutorProfile> findByTutorId(Long tutorId) { return findByUserId(tutorId); }

    /**
     * Eagerly fetches expertSubjects via JOIN FETCH to avoid LazyInitializationException.
     * A separate query is used for availabilitySlots (see below) because fetching two
     * bag-typed collections in one query causes a MultipleBagFetchException.
     */
    @Query("SELECT DISTINCT tp FROM TutorProfile tp LEFT JOIN FETCH tp.expertSubjects WHERE tp.user.id = :userId")
    Optional<TutorProfile> findByUserIdWithSubjects(@Param("userId") Long userId);

    /**
     * Eagerly fetches availabilitySlots via JOIN FETCH to avoid LazyInitializationException.
     */
    @Query("SELECT DISTINCT tp FROM TutorProfile tp LEFT JOIN FETCH tp.availabilitySlots WHERE tp.user.id = :userId")
    Optional<TutorProfile> findByUserIdWithSlots(@Param("userId") Long userId);

    List<TutorProfile> findBySubject(Subject subject);
    List<TutorProfile> findBySubjectId(Long subjectId);
    List<TutorProfile> findByIsAvailableTrue();

    // Only APPROVED tutors, available, sorted by credibility
    @Query("SELECT tp FROM TutorProfile tp WHERE tp.subject.id = :subjectId AND tp.isAvailable = true AND tp.verificationStatus = 'APPROVED' ORDER BY tp.credibilityScore DESC")
    List<TutorProfile> findAvailableTutorsBySubjectOrderByCredibility(@Param("subjectId") Long subjectId);

    // APPROVED + minimum proficiency
    @Query("SELECT tp FROM TutorProfile tp WHERE tp.subject.id = :subjectId AND tp.isAvailable = true AND tp.verificationStatus = 'APPROVED' AND tp.proficiencyLevel >= :minProficiency ORDER BY tp.credibilityScore DESC")
    List<TutorProfile> findQualifiedTutors(@Param("subjectId") Long subjectId, @Param("minProficiency") Integer minProficiency);

    boolean existsByUser(User user);
    default boolean existsByTutor(User tutor) { return existsByUser(tutor); }

    // For admin: find by verification status
    List<TutorProfile> findByVerificationStatus(String verificationStatus);
}
