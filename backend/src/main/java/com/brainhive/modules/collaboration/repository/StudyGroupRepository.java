package com.brainhive.modules.collaboration.repository;

import com.brainhive.modules.collaboration.model.StudyGroup;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    Optional<StudyGroup> findByInviteCode(String inviteCode);

    List<StudyGroup> findByCreatedBy(User user);

    @Query("SELECT g FROM StudyGroup g JOIN g.members m WHERE m.user = :user AND g.isActive = true")
    List<StudyGroup> findGroupsByMember(@Param("user") User user);

    List<StudyGroup> findBySubjectAndIsActiveTrue(String subject);
}
