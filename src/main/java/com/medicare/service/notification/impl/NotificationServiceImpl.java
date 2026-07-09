package com.medicare.service.notification.impl;

import com.medicare.dto.response.NotificationResponseDTO;
import com.medicare.entity.Notification;
import com.medicare.entity.User;
import com.medicare.exception.CustomException;
import com.medicare.repository.NotificationRepository;
import com.medicare.service.notification.NotificationService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(User user, String message, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .link(link)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyNotifications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException("Thông báo không tồn tại.", HttpStatus.NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new CustomException("Bạn không có quyền thay đổi thông báo này.", HttpStatus.FORBIDDEN);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    private NotificationResponseDTO mapToDto(Notification entity) {
        return NotificationResponseDTO.builder()
                .id(entity.getId())
                .message(entity.getMessage())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .link(entity.getLink())
                .build();
    }
}
