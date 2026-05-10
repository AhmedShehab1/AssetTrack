package com.assettrack.service.notification;

import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.notification.NotificationPreferences;
import com.assettrack.domain.user.User;
import com.assettrack.dto.notification.NotificationPreferencesRequest;
import com.assettrack.dto.notification.NotificationPreferencesResponse;
import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.notification.NotificationPreferencesRepository;
import com.assettrack.repository.notification.NotificationRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final NotificationPreferencesRepository notificationPreferencesRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getCurrentUserNotifications(Authentication authentication, Pageable pageable) {
        String recipient = getCurrentUserEmail(authentication);
        return notificationRepository.findByRecipient(recipient, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public NotificationResponse markAsRead(java.util.UUID notificationId, Authentication authentication) {
        String recipient = getCurrentUserEmail(authentication);
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, recipient)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Authentication authentication) {
        String recipient = getCurrentUserEmail(authentication);
        notificationRepository.markAllAsReadByRecipient(recipient);
    }

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(Authentication authentication) {
        UUID userId = securityUtils.getCurrentUserId(authentication);
        return notificationPreferencesRepository.findByUserId(userId)
                .map(this::toPreferencesResponse)
                .orElseGet(() -> defaultPreferences(userId));
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(
            NotificationPreferencesRequest request, Authentication authentication) {
        UUID userId = securityUtils.getCurrentUserId(authentication);
        NotificationPreferences prefs = notificationPreferencesRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreferences p = new NotificationPreferences();
                    p.setUserId(userId);
                    return p;
                });

        if (request.warrantyExpiryDaysThreshold() != null)
            prefs.setWarrantyExpiryDaysThreshold(request.warrantyExpiryDaysThreshold());
        if (request.lowStockThreshold() != null)
            prefs.setLowStockThreshold(request.lowStockThreshold());
        if (request.emailNotificationsEnabled() != null)
            prefs.setEmailNotificationsEnabled(request.emailNotificationsEnabled());
        if (request.inAppNotificationsEnabled() != null)
            prefs.setInAppNotificationsEnabled(request.inAppNotificationsEnabled());

        prefs.setUpdatedAt(LocalDateTime.now());
        return toPreferencesResponse(notificationPreferencesRepository.save(prefs));
    }

// ── private helpers ───────────────────────────────────────────────────────────

    private NotificationPreferencesResponse toPreferencesResponse(NotificationPreferences prefs) {
        return new NotificationPreferencesResponse(
                prefs.getUserId(),
                prefs.getWarrantyExpiryDaysThreshold(),
                prefs.getLowStockThreshold(),
                prefs.isEmailNotificationsEnabled(),
                prefs.isInAppNotificationsEnabled(),
                prefs.getUpdatedAt()
        );
    }

    private NotificationPreferencesResponse defaultPreferences(UUID userId) {
        return new NotificationPreferencesResponse(userId, 30, 5, true, true, null);
    }

    private String getCurrentUserEmail(Authentication authentication) {
        java.util.UUID userId = securityUtils.getCurrentUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return user.getEmail();
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessageBody(),
                notification.isRead(),
                notification.getAssetId(),
                notification.getCreatedAt());
    }
}
