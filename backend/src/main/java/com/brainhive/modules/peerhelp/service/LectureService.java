package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.CreateLectureDTO;
import com.brainhive.modules.peerhelp.dto.CreateLectureHelpRequestDTO;
import com.brainhive.modules.peerhelp.dto.HelpRequestResponseDTO;
import com.brainhive.modules.peerhelp.dto.LectureDetailResponseDTO;
import com.brainhive.modules.peerhelp.dto.LectureResponseDTO;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;
import com.brainhive.modules.peerhelp.model.Lecture;
import com.brainhive.modules.peerhelp.model.LectureAttendance;
import com.brainhive.modules.peerhelp.model.Subject;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.peerhelp.repository.LectureAttendanceRepository;
import com.brainhive.modules.peerhelp.repository.LectureRepository;
import com.brainhive.modules.peerhelp.repository.SubjectRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.repository.UserRepository;

@Service
@Transactional
public class LectureService {

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private LectureAttendanceRepository lectureAttendanceRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    public LectureResponseDTO createLecture(Long tutorId, CreateLectureDTO dto) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor not found with ID: " + tutorId));

        if (tutor.getRole() != UserRole.TUTOR) {
            throw new IllegalArgumentException("Only tutors can create lectures");
        }

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + dto.getSubjectId()));

        Lecture lecture = new Lecture();
        lecture.setTutor(tutor);
        lecture.setSubject(subject);
        lecture.setTitle(dto.getTitle().trim());
        lecture.setDescription(dto.getDescription().trim());
        lecture.setScheduledAt(dto.getScheduledAt());
        lecture.setDurationMinutes(dto.getDurationMinutes());
        lecture.setMeetingLink(dto.getMeetingLink() != null ? dto.getMeetingLink().trim() : null);

        Lecture savedLecture = lectureRepository.save(lecture);
        return LectureResponseDTO.fromEntity(savedLecture);
    }

    public List<LectureResponseDTO> getTutorLectures(Long tutorId) {
        return lectureRepository.findByTutorIdOrderByScheduledAtDesc(tutorId)
                .stream()
                .map(LectureResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<LectureResponseDTO> getAllLectures() {
        return lectureRepository.findAllByOrderByScheduledAtDesc()
                .stream()
                .map(LectureResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public LectureDetailResponseDTO getLectureDetails(Long lectureId, Long currentUserId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found with ID: " + lectureId));

        LectureDetailResponseDTO dto = LectureDetailResponseDTO.fromLecture(lecture);
        dto.setAttendeeCount(lectureAttendanceRepository.countByLectureId(lectureId));
        if (currentUserId != null) {
            dto.setAttendedByCurrentUser(lectureAttendanceRepository.existsByLectureIdAndStudentId(lectureId, currentUserId));
        }
        return dto;
    }

    public void attendLecture(Long lectureId, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Only students can attend lectures");
        }

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found with ID: " + lectureId));

        if (lectureAttendanceRepository.existsByLectureIdAndStudentId(lectureId, studentId)) {
            return;
        }

        LectureAttendance attendance = new LectureAttendance();
        attendance.setLecture(lecture);
        attendance.setStudent(student);
        lectureAttendanceRepository.save(attendance);
    }

    public HelpRequestResponseDTO createHelpRequestForLecture(Long lectureId, Long studentId, CreateLectureHelpRequestDTO dto) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Only students can create help requests");
        }

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found with ID: " + lectureId));

        HelpRequest request = new HelpRequest();
        request.setStudent(student);
        request.setSubject(lecture.getSubject());
        request.setTopic(dto.getTopic().trim());
        request.setDescription(dto.getDescription().trim());
        request.setStatus(HelpRequestStatus.PENDING);
        Integer urgency = dto.getUrgencyLevel();
        request.setUrgencyLevel(urgency == null ? 3 : urgency);
        request.setPreferredDateTime(dto.getPreferredDateTime() != null ? dto.getPreferredDateTime() : lecture.getScheduledAt());
        Integer duration = dto.getEstimatedDuration();
        request.setEstimatedDuration(duration == null ? 60 : duration);
        request.setAssignedTutor(lecture.getTutor());

        HelpRequest saved = helpRequestRepository.save(request);
        return HelpRequestResponseDTO.fromEntity(saved);
    }
}
