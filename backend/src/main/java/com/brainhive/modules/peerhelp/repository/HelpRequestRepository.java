package com.brainhive.modules.peerhelp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;
import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.user.model.User;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
    
    List<HelpRequest> findByStudent(User student);
    
    List<HelpRequest> findByStudentId(Long studentId);
    
    List<HelpRequest> findByAssignedTutor(User tutor);
    
    List<HelpRequest> findByAssignedTutorId(Long tutorId);
    
    List<HelpRequest> findByStatus(HelpRequestStatus status);
    
    List<HelpRequest> findBySubject(Subject subject);
    
    List<HelpRequest> findBySubjectId(Long subjectId);
    
    List<HelpRequest> findByStudentAndStatus(User student, HelpRequestStatus status);
    
    List<HelpRequest> findByStudentIdAndStatus(Long studentId, HelpRequestStatus status);
    
    List<HelpRequest> findByAssignedTutorAndStatus(User tutor, HelpRequestStatus status);
    
    List<HelpRequest> findByAssignedTutorIdAndStatus(Long tutorId, HelpRequestStatus status);
    
    @Query("SELECT hr FROM HelpRequest hr WHERE hr.subject.id = :subjectId AND hr.status = :status ORDER BY hr.urgencyLevel DESC, hr.createdAt ASC")
    List<HelpRequest> findPendingRequestsBySubjectOrderByPriority(@Param("subjectId") Long subjectId, @Param("status") HelpRequestStatus status);

    @Query("SELECT hr FROM HelpRequest hr WHERE hr.status = :status AND ((hr.subject.id = :subjectId AND hr.assignedTutor IS NULL) OR (hr.assignedTutor.id = :tutorId)) ORDER BY hr.urgencyLevel DESC, hr.createdAt ASC")
    List<HelpRequest> findPendingRequestsForTutor(@Param("subjectId") Long subjectId, @Param("tutorId") Long tutorId, @Param("status") HelpRequestStatus status);

    @Query("SELECT hr FROM HelpRequest hr WHERE hr.status = :status AND hr.assignedTutor.id = :tutorId ORDER BY hr.urgencyLevel DESC, hr.createdAt ASC")
    List<HelpRequest> findPendingAssignedRequestsForTutor(@Param("tutorId") Long tutorId, @Param("status") HelpRequestStatus status);
    
    @Query("SELECT hr FROM HelpRequest hr WHERE hr.status = 'PENDING' ORDER BY hr.urgencyLevel DESC, hr.createdAt ASC")
    List<HelpRequest> findAllPendingOrderByPriority();
    
    @Query("SELECT COUNT(hr) FROM HelpRequest hr WHERE hr.student.id = :studentId AND hr.status IN :statuses")
    Long countByStudentAndStatusIn(@Param("studentId") Long studentId, @Param("statuses") List<HelpRequestStatus> statuses);
}
