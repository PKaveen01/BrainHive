package com.brainhive.modules.peerhelp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brainhive.modules.peerhelp.dto.CreateHelpRequestMessageDTO;
import com.brainhive.modules.peerhelp.dto.HelpRequestMessageResponseDTO;
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
    private HelpRequestMessageRepository messageRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<HelpRequestMessageResponseDTO> getMessages(Long requestId, Long userId) {
        validateAccess(requestId, userId);
        return messageRepository.findByHelpRequestIdOrderByCreatedAtAsc(requestId)
                .stream()
                .map(HelpRequestMessageResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public HelpRequestMessageResponseDTO sendMessage(Long requestId, Long userId, CreateHelpRequestMessageDTO dto) {
        HelpRequest request = validateAccess(requestId, userId);
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        HelpRequestMessage message = new HelpRequestMessage();
        message.setHelpRequest(request);
        message.setSender(sender);
        message.setMessageText(dto.getMessage().trim());

        HelpRequestMessage saved = messageRepository.save(message);
        return HelpRequestMessageResponseDTO.fromEntity(saved);
    }

    private HelpRequest validateAccess(Long requestId, Long userId) {
        HelpRequest request = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Help request not found with ID: " + requestId));

        boolean isStudent = request.getStudent().getId().equals(userId);
        boolean isAssignedTutor = request.getAssignedTutor() != null
                && request.getAssignedTutor().getId().equals(userId);

        if (!isStudent && !isAssignedTutor) {
            throw new IllegalArgumentException("You are not authorized to access this conversation");
        }

        return request;
    }
}
