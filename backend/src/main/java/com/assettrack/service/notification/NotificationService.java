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

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

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
