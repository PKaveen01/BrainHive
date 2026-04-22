package com.brainhive.modules.peerhelp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brainhive.modules.peerhelp.model.HelpRequestMessage;

@Repository
public interface HelpRequestMessageRepository extends JpaRepository<HelpRequestMessage, Long> {

    List<HelpRequestMessage> findByHelpRequestIdOrderByCreatedAtAsc(Long helpRequestId);
}
