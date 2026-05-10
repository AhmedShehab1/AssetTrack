package com.assettrack.service.notification;

import com.assettrack.dto.notification.NotificationPreferencesRequest;
import com.assettrack.dto.notification.NotificationPreferencesResponse;
import com.assettrack.dto.notification.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface INotificationService {
    Page<NotificationResponse> getCurrentUserNotifications(Authentication authentication, Pageable pageable);

    NotificationResponse markAsRead(UUID notificationId, Authentication authentication);

    // POST /notifications/read-all
    void markAllAsRead(Authentication authentication);

    // GET /notifications/preferences
    NotificationPreferencesResponse getPreferences(Authentication authentication);

    // PUT /notifications/preferences
    NotificationPreferencesResponse updatePreferences(
            NotificationPreferencesRequest request, Authentication authentication);
}