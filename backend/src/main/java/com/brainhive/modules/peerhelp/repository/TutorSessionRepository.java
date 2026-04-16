package com.brainhive.modules.peerhelp.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.TutorSession;
import com.brainhive.modules.user.model.User;

@Repository
public interface TutorSessionRepository extends JpaRepository<TutorSession, Long> {
    
    Optional<TutorSession> findByHelpRequest(HelpRequest helpRequest);
    
    Optional<TutorSession> findByHelpRequestId(Long helpRequestId);
    
    List<TutorSession> findByStudent(User student);
    
    List<TutorSession> findByStudentId(Long studentId);
    
    List<TutorSession> findByTutor(User tutor);
    
    List<TutorSession> findByTutorId(Long tutorId);
    
    List<TutorSession> findByIsCompletedFalse();
    
    List<TutorSession> findByIsCompletedTrue();
    
    List<TutorSession> findByTutorAndIsCompletedFalse(User tutor);
    
    List<TutorSession> findByStudentAndIsCompletedFalse(User student);
    
    @Query("SELECT ts FROM TutorSession ts WHERE ts.tutor.id = :tutorId AND ts.scheduledStartTime BETWEEN :start AND :end")
    List<TutorSession> findTutorSessionsInTimeRange(@Param("tutorId") Long tutorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT ts FROM TutorSession ts WHERE ts.student.id = :studentId AND ts.tutor.id = :tutorId AND ts.isCompleted = true ORDER BY ts.scheduledEndTime DESC")
    List<TutorSession> findCompletedSessionsByStudentAndTutor(@Param("studentId") Long studentId, @Param("tutorId") Long tutorId);
    
    @Query("SELECT COUNT(ts) FROM TutorSession ts WHERE ts.tutor.id = :tutorId AND ts.isCompleted = true")
    Long countCompletedSessionsByTutor(@Param("tutorId") Long tutorId);
}
