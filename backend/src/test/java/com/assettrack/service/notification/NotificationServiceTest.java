package com.assettrack.service.notification;

import java.util.UUID;
import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.notification.NotificationType;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.repository.notification.NotificationRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

        @Mock
        private NotificationRepository notificationRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private SecurityUtils securityUtils;

        @Mock
        private Authentication authentication;

        @InjectMocks
        private NotificationService notificationService;

        @Test
        void getCurrentUserNotifications_ReturnsOnlyAlertsForLoggedInUser() {
                User currentUser = testUser();
                Notification notification = Notification.builder()
                                .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                                .recipient(currentUser.getEmail())
                                .messageBody("Laptop warranty expires soon")
                                .type(NotificationType.LOW_STOCK)
                                .createdAt(LocalDateTime.of(2026, 5, 7, 12, 0))
                                .build();

                when(securityUtils.getCurrentUserId(authentication)).thenReturn(currentUser.getId());
                when(userRepository.findById(currentUser.getId())).thenReturn(Optional.of(currentUser));
                when(notificationRepository.findByRecipient(eq(currentUser.getEmail()), any(Pageable.class)))
                                .thenReturn(new PageImpl<>(List.of(notification)));

                Page<NotificationResponse> responses = notificationService.getCurrentUserNotifications(authentication, Pageable.unpaged());

                assertThat(responses.getContent()).hasSize(1);
                assertThat(responses.getContent().get(0).getMessage()).isEqualTo("Laptop warranty expires soon");
                verify(notificationRepository).findByRecipient(eq(currentUser.getEmail()), any(Pageable.class));
        }

        @Test
        void markAsRead_UpdatesOnlyTheLoggedInUsersNotification() {
                User currentUser = testUser();
                Notification notification = Notification.builder()
                                .id(UUID.fromString("00000000-0000-0000-0000-000000000005"))
                                .recipient(currentUser.getEmail())
                                .messageBody("Condition report created")
                                .type(NotificationType.CONDITION_REPORT_OPENED)
                                .createdAt(LocalDateTime.of(2026, 5, 7, 12, 30))
                                .build();

                when(securityUtils.getCurrentUserId(authentication)).thenReturn(currentUser.getId());
                when(userRepository.findById(currentUser.getId())).thenReturn(Optional.of(currentUser));
                when(notificationRepository.findByIdAndRecipient(notification.getId(), currentUser.getEmail()))
                                .thenReturn(Optional.of(notification));
                when(notificationRepository.save(notification)).thenReturn(notification);

                NotificationResponse response = notificationService.markAsRead(notification.getId(), authentication);

                assertThat(notification.isRead()).isTrue();
                assertThat(response.isRead()).isTrue();
                verify(notificationRepository).findByIdAndRecipient(notification.getId(), currentUser.getEmail());
        }

        private User testUser() {
                return User.builder()
                                .id(UUID.fromString("00000000-0000-0000-0000-000000000007"))
                                .email("developer@assettrack.com")
                                .passwordHash("$2a$12$hashed_password")
                                .role(Role.DEVELOPER)
                                .build();
        }
}
