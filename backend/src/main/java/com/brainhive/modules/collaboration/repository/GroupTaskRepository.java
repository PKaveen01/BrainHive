package com.brainhive.modules.collaboration.repository;

import com.brainhive.modules.collaboration.model.GroupTask;
import com.brainhive.modules.collaboration.model.StudyGroup;
import com.brainhive.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupTaskRepository extends JpaRepository<GroupTask, Long> {

    List<GroupTask> findByGroupOrderByCreatedAtDesc(StudyGroup group);

    List<GroupTask> findByGroupAndAssignedTo(StudyGroup group, User user);

    List<GroupTask> findByAssignedTo(User user);
}
