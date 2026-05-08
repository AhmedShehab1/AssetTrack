package com.assettrack.repository.notification;

import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.notification.NotificationType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void findByRecipientOrderByCreatedAtDesc_returnsNotificationsNewestFirst() {
        Notification older = notificationRepository.save(Notification.builder()
                .recipient("alice@example.com")
                .messageBody("Older message")
                .type(NotificationType.ASSET_ALLOCATED)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        Notification newer = notificationRepository.save(Notification.builder()
                .recipient("alice@example.com")
                .messageBody("Newer message")
                .type(NotificationType.CONDITION_REPORT_OPENED)
                .createdAt(LocalDateTime.now().minusHours(1))
                .build());

        notificationRepository.save(Notification.builder()
                .recipient("bob@example.com")
                .messageBody("Different user")
                .type(NotificationType.LOW_STOCK)
                .createdAt(LocalDateTime.now())
                .build());

        assertThat(notificationRepository.findByRecipient("alice@example.com", PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent())
                .extracting(Notification::getId)
                .containsExactly(newer.getId(), older.getId());
    }

    @Test
    void findByIdAndRecipient_returnsMatchingNotificationOnly() {
        Notification saved = notificationRepository.save(Notification.builder()
                .recipient("alice@example.com")
                .messageBody("Read me")
                .type(NotificationType.CONDITION_REPORT_RESOLVED)
                .createdAt(LocalDateTime.now())
                .build());

        assertThat(notificationRepository.findByIdAndRecipient(saved.getId(), "alice@example.com"))
                .contains(saved);
        assertThat(notificationRepository.findByIdAndRecipient(saved.getId(), "bob@example.com"))
                .isEmpty();
    }
}