package com.brainhive.modules.collaboration.repository;

import com.brainhive.modules.collaboration.model.GroupMessage;
import com.brainhive.modules.collaboration.model.StudyGroup;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    List<GroupMessage> findByGroupOrderBySentAtAsc(StudyGroup group);

    List<GroupMessage> findByGroupOrderBySentAtDesc(StudyGroup group, Pageable pageable);
}
