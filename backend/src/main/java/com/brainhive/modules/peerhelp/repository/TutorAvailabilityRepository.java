package com.brainhive.modules.peerhelp.repository;

import com.brainhive.modules.peerhelp.model.TutorAvailability;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface TutorAvailabilityRepository extends JpaRepository<TutorAvailability, Long> {
    
    List<TutorAvailability> findByTutor(User tutor);
    
    List<TutorAvailability> findByTutorId(Long tutorId);
    
    List<TutorAvailability> findByTutorAndIsActiveTrue(User tutor);
    
    List<TutorAvailability> findByTutorIdAndIsActiveTrue(Long tutorId);
    
    List<TutorAvailability> findByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);
    
    @Query("SELECT ta FROM TutorAvailability ta WHERE ta.tutor.id = :tutorId AND ta.dayOfWeek = :dayOfWeek AND ta.isActive = true")
    List<TutorAvailability> findByTutorAndDayOfWeek(@Param("tutorId") Long tutorId, @Param("dayOfWeek") DayOfWeek dayOfWeek);
    
    @Query("SELECT DISTINCT ta.tutor FROM TutorAvailability ta WHERE ta.dayOfWeek = :dayOfWeek AND ta.isActive = true AND ta.isRecurring = true")
    List<User> findAvailableTutorsOnDay(@Param("dayOfWeek") DayOfWeek dayOfWeek);
}
