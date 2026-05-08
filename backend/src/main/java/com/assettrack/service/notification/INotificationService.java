package com.assettrack.service.notification;

import com.assettrack.dto.notification.NotificationResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface INotificationService {
    List<NotificationResponse> getCurrentUserNotifications(Authentication authentication);

    NotificationResponse markAsRead(UUID notificationId, Authentication authentication);
}