package com.brainhive.modules.peerhelp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brainhive.modules.peerhelp.dto.ApiResponse;
import com.brainhive.modules.peerhelp.dto.CreateLectureDTO;
import com.brainhive.modules.peerhelp.dto.CreateLectureHelpRequestDTO;
import com.brainhive.modules.peerhelp.dto.HelpRequestResponseDTO;
import com.brainhive.modules.peerhelp.dto.LectureDetailResponseDTO;
import com.brainhive.modules.peerhelp.dto.LectureResponseDTO;
import com.brainhive.modules.peerhelp.service.LectureService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.UserRole;
import com.brainhive.modules.user.service.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/peerhelp/lectures")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LectureController {

    @Autowired
    private LectureService lectureService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<LectureResponseDTO>> createLecture(
            @Valid @RequestBody CreateLectureDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only tutors can create lectures"));
            }

            LectureResponseDTO lecture = lectureService.createLecture(currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Lecture created successfully", lecture));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LectureResponseDTO>>> getMyLectures(HttpSession session) {
        User currentUser = userService.getCurrentUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Please login to continue"));
        }

        if (currentUser.getRole() != UserRole.TUTOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only tutors can view their lectures"));
        }

        List<LectureResponseDTO> lectures = lectureService.getTutorLectures(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Tutor lectures retrieved successfully", lectures));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureResponseDTO>>> getAllLectures(HttpSession session) {
        User currentUser = userService.getCurrentUser(session);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Please login to continue"));
        }

        List<LectureResponseDTO> lectures = lectureService.getAllLectures();
        return ResponseEntity.ok(ApiResponse.success("Lectures retrieved successfully", lectures));
    }

    @GetMapping("/{lectureId}")
    public ResponseEntity<ApiResponse<LectureDetailResponseDTO>> getLectureById(
            @PathVariable Long lectureId,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            LectureDetailResponseDTO lecture = lectureService.getLectureDetails(lectureId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Lecture retrieved successfully", lecture));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{lectureId}/attend")
    public ResponseEntity<ApiResponse<Void>> attendLecture(@PathVariable Long lectureId, HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can attend lectures"));
            }

            lectureService.attendLecture(lectureId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Lecture attendance recorded", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{lectureId}/help-request")
    public ResponseEntity<ApiResponse<HelpRequestResponseDTO>> createLectureHelpRequest(
            @PathVariable Long lectureId,
            @Valid @RequestBody CreateLectureHelpRequestDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            if (currentUser.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only students can request help"));
            }

            HelpRequestResponseDTO request = lectureService.createHelpRequestForLecture(lectureId, currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Help request sent to lecture tutor", request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
