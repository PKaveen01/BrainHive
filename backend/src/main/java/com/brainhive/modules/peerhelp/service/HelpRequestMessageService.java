package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.HelpRequestMessageDTO;
import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestMessage;
import com.brainhive.modules.peerhelp.repository.HelpRequestMessageRepository;
import com.brainhive.modules.peerhelp.repository.HelpRequestRepository;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.repository.UserRepository;

@Service
@Transactional
public class HelpRequestMessageService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private HelpRequestMessageRepository helpRequestMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<HelpRequestMessageDTO> getMessages(Long requestId, Long currentUserId) {
        HelpRequest hr = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        assertParticipant(hr, user);
        return helpRequestMessageRepository.findByHelpRequestIdOrderByCreatedAtAsc(requestId)
                .stream()
                .map(HelpRequestMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public HelpRequestMessageDTO postMessage(Long requestId, Long senderUserId, String body) {
        if (body == null || body.trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        String trimmed = body.trim();
        if (trimmed.length() > 4000) {
            throw new IllegalArgumentException("Message is too long");
        }

        HelpRequest hr = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found"));
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        assertParticipant(hr, sender);

        HelpRequestMessage m = new HelpRequestMessage();
        m.setHelpRequest(hr);
        m.setSender(sender);
        m.setBody(trimmed);
        HelpRequestMessage saved = helpRequestMessageRepository.save(m);
        return HelpRequestMessageDTO.fromEntity(saved);
    }

    public void seedInitialMessage(Long requestId, Long studentId, String body) {
        postMessage(requestId, studentId, body);
    }

    private void assertParticipant(HelpRequest hr, User user) {
        boolean student = hr.getStudent().getId().equals(user.getId());
        boolean tutor = hr.getAssignedTutor() != null && hr.getAssignedTutor().getId().equals(user.getId());
        if (!student && !tutor) {
            throw new IllegalArgumentException("Not authorized to view this conversation");
        }
    }
}
