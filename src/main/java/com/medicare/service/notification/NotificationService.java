package com.medicare.service.notification;

import com.medicare.dto.response.NotificationResponseDTO;
import com.medicare.entity.User;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    void createNotification(User user, String message, String link);
    List<NotificationResponseDTO> getMyNotifications();
    void markAsRead(UUID notificationId);
    long getUnreadCount();
}
