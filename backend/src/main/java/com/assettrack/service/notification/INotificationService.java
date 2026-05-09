package com.assettrack.service.notification;

import com.assettrack.dto.notification.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.UUID;

/**
 * Contract for in-app notification operations.
 */
public interface INotificationService {
    Page<NotificationResponse> getCurrentUserNotifications(Authentication authentication, Pageable pageable);

    NotificationResponse markAsRead(UUID notificationId, Authentication authentication);
}