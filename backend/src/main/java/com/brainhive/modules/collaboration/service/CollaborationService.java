package com.brainhive.modules.collaboration.service;

import com.brainhive.modules.collaboration.dto.CollaborationDTOs.*;
import com.brainhive.modules.collaboration.model.*;
import com.brainhive.modules.collaboration.repository.*;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CollaborationService {

    @Autowired private StudyGroupRepository groupRepo;
    @Autowired private GroupMemberRepository memberRepo;
    @Autowired private GroupMessageRepository messageRepo;
    @Autowired private GroupTaskRepository taskRepo;
    @Autowired private GroupEventRepository eventRepo;
    @Autowired private UserRepository userRepo;

    // ==================== GROUP ====================

    public GroupResponseDTO createGroup(Long userId, CreateGroupRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        StudyGroup group = new StudyGroup();
        group.setName(req.getName());
        group.setDescription(req.getDescription());
        group.setSubject(req.getSubject());
        group.setGoal(req.getGoal());
        group.setCreatedBy(user);
        group.setMaxMembers(req.getMaxMembers() != null ? req.getMaxMembers() : 20);
        group.setInviteCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        group = groupRepo.save(group);

        GroupMember admin = new GroupMember(group, user, "ADMIN");
        memberRepo.save(admin);

        return toGroupDTO(group, userId);
    }

    public GroupResponseDTO joinGroup(Long userId, JoinGroupRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findByInviteCode(req.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Already a member of this group");
        }
        if (memberRepo.countByGroup(group) >= group.getMaxMembers()) {
            throw new RuntimeException("Group is full");
        }

        GroupMember member = new GroupMember(group, user, "MEMBER");
        memberRepo.save(member);
        return toGroupDTO(group, userId);
    }

    public List<GroupResponseDTO> getMyGroups(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return groupRepo.findGroupsByMember(user).stream()
                .map(g -> toGroupDTO(g, userId))
                .collect(Collectors.toList());
    }

    public GroupResponseDTO getGroupById(Long groupId, Long userId) {
        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return toGroupDTO(group, userId);
    }

    public void leaveGroup(Long groupId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        GroupMember member = memberRepo.findByGroupAndUser(group, user)
                .orElseThrow(() -> new RuntimeException("Not a member of this group"));
        memberRepo.delete(member);
    }

    public void removeMember(Long groupId, Long targetUserId, Long requesterId) {
        User requester = userRepo.findById(requesterId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember requesterMembership = memberRepo.findByGroupAndUser(group, requester)
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (!"ADMIN".equals(requesterMembership.getRole())) {
            throw new RuntimeException("Only admins can remove members");
        }

        User targetUser = userRepo.findById(targetUserId).orElseThrow(() -> new RuntimeException("Target user not found"));
        GroupMember targetMember = memberRepo.findByGroupAndUser(group, targetUser)
                .orElseThrow(() -> new RuntimeException("Target is not a member"));
        memberRepo.delete(targetMember);
    }

    // ==================== MESSAGES ====================

    public MessageResponseDTO sendMessage(Long groupId, Long userId, SendMessageRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Not a member of this group");
        }

        GroupMessage msg = new GroupMessage(group, user, req.getContent());
        msg = messageRepo.save(msg);
        return new MessageResponseDTO(msg.getId(), groupId, userId, user.getFullName(), msg.getContent(), msg.getSentAt());
    }

    public List<MessageResponseDTO> getMessages(Long groupId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Not a member of this group");
        }

        return messageRepo.findByGroupOrderBySentAtAsc(group).stream()
                .map(m -> new MessageResponseDTO(m.getId(), groupId,
                        m.getSender().getId(), m.getSender().getFullName(),
                        m.getContent(), m.getSentAt()))
                .collect(Collectors.toList());
    }

    // ==================== TASKS ====================

    public TaskResponseDTO createTask(Long groupId, Long userId, CreateTaskRequest req) {
        User creator = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, creator)) {
            throw new RuntimeException("Not a member of this group");
        }

        GroupTask task = new GroupTask();
        task.setGroup(group);
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setDueDate(req.getDueDate());
        task.setStatus("TODO");
        task.setCreatedBy(creator);

        if (req.getAssignedToUserId() != null) {
            User assignee = userRepo.findById(req.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignedTo(assignee);
        }

        task = taskRepo.save(task);
        return toTaskDTO(task);
    }

    public TaskResponseDTO updateTaskStatus(Long taskId, Long userId, UpdateTaskStatusRequest req) {
        GroupTask task = taskRepo.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (!memberRepo.existsByGroupAndUser(task.getGroup(), user)) {
            throw new RuntimeException("Not a member of this group");
        }

        task.setStatus(req.getStatus());
        task = taskRepo.save(task);
        return toTaskDTO(task);
    }

    public List<TaskResponseDTO> getGroupTasks(Long groupId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Not a member of this group");
        }

        return taskRepo.findByGroupOrderByCreatedAtDesc(group).stream()
                .map(this::toTaskDTO)
                .collect(Collectors.toList());
    }

    // ==================== EVENTS ====================

    public EventResponseDTO createEvent(Long groupId, Long userId, CreateEventRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Not a member of this group");
        }

        GroupEvent event = new GroupEvent();
        event.setGroup(group);
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setEventTime(req.getEventTime());
        event.setLocation(req.getLocation());
        event.setCreatedBy(user);

        event = eventRepo.save(event);
        return toEventDTO(event);
    }

    public List<EventResponseDTO> getGroupEvents(Long groupId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        if (!memberRepo.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Not a member of this group");
        }

        return eventRepo.findByGroupOrderByEventTimeAsc(group).stream()
                .map(this::toEventDTO)
                .collect(Collectors.toList());
    }

    // ==================== MAPPERS ====================

    private GroupResponseDTO toGroupDTO(StudyGroup g, Long currentUserId) {
        GroupResponseDTO dto = new GroupResponseDTO();
        dto.setId(g.getId());
        dto.setName(g.getName());
        dto.setDescription(g.getDescription());
        dto.setSubject(g.getSubject());
        dto.setGoal(g.getGoal());
        dto.setInviteCode(g.getInviteCode());
        dto.setCreatedByName(g.getCreatedBy().getFullName());
        dto.setCreatedById(g.getCreatedBy().getId());
        dto.setMaxMembers(g.getMaxMembers());
        dto.setIsActive(g.getIsActive());
        dto.setCreatedAt(g.getCreatedAt());

        List<GroupMember> members = memberRepo.findByGroup(g);
        dto.setCurrentMembers(members.size());
        dto.setMembers(members.stream().map(m ->
                new MemberDTO(m.getUser().getId(), m.getUser().getFullName(), m.getUser().getEmail(),
                        m.getRole(), m.getJoinedAt())).collect(Collectors.toList()));

        members.stream()
                .filter(m -> m.getUser().getId().equals(currentUserId))
                .findFirst()
                .ifPresent(m -> dto.setCurrentUserRole(m.getRole()));

        return dto;
    }

    private TaskResponseDTO toTaskDTO(GroupTask t) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(t.getId());
        dto.setGroupId(t.getGroup().getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setDueDate(t.getDueDate());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        if (t.getCreatedBy() != null) dto.setCreatedByName(t.getCreatedBy().getFullName());
        if (t.getAssignedTo() != null) {
            dto.setAssignedToName(t.getAssignedTo().getFullName());
            dto.setAssignedToUserId(t.getAssignedTo().getId());
        }
        return dto;
    }

    private EventResponseDTO toEventDTO(GroupEvent e) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(e.getId());
        dto.setGroupId(e.getGroup().getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setEventTime(e.getEventTime());
        dto.setLocation(e.getLocation());
        dto.setCreatedAt(e.getCreatedAt());
        if (e.getCreatedBy() != null) dto.setCreatedByName(e.getCreatedBy().getFullName());
        return dto;
    }
}
