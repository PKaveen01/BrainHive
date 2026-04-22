package com.brainhive.modules.collaboration.repository;

import com.brainhive.modules.collaboration.model.GroupEvent;
import com.brainhive.modules.collaboration.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupEventRepository extends JpaRepository<GroupEvent, Long> {

    List<GroupEvent> findByGroupOrderByEventTimeAsc(StudyGroup group);
}
