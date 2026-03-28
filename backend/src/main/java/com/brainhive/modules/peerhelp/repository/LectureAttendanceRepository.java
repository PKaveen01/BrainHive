package com.brainhive.modules.peerhelp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.LectureAttendance;

@Repository
public interface LectureAttendanceRepository extends JpaRepository<LectureAttendance, Long> {

    boolean existsByLectureIdAndStudentId(Long lectureId, Long studentId);

    long countByLectureId(Long lectureId);
}
