package com.brainhive.modules.collaboration.repository;

import com.brainhive.modules.collaboration.model.GroupMember;
import com.brainhive.modules.collaboration.model.StudyGroup;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Optional<GroupMember> findByGroupAndUser(StudyGroup group, User user);

    List<GroupMember> findByGroup(StudyGroup group);

    boolean existsByGroupAndUser(StudyGroup group, User user);

    int countByGroup(StudyGroup group);
}
