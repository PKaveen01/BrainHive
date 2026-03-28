package com.brainhive.modules.peerhelp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.Lecture;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByTutorIdOrderByScheduledAtDesc(Long tutorId);

    List<Lecture> findAllByOrderByScheduledAtDesc();
}
