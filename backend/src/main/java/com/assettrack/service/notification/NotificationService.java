package com.assettrack.service.notification;

import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.user.User;
import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.notification.NotificationRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

/**
 * Notification service for retrieving and updating user notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getCurrentUserNotifications(Authentication authentication, Pageable pageable) {
        String recipient = getCurrentUserEmail(authentication);
        log.debug("Loading notifications for recipient {}", recipient);
        return notificationRepository.findByRecipient(recipient, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public NotificationResponse markAsRead(java.util.UUID notificationId, Authentication authentication) {
        String recipient = getCurrentUserEmail(authentication);
        log.debug("Marking notification {} as read for recipient {}", notificationId, recipient);
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, recipient)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        log.info("Notification {} marked as read", notificationId);
        return toResponse(saved);
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
