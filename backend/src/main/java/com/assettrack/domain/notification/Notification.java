package com.assettrack.domain.notification;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Notification entity stored for in-app alerts.
 */
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    /** Notification identifier. */
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    /** User identifier used as the recipient. */
    @Column(nullable = false)
    private String recipient;

    /** Message body shown to the recipient. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageBody;

    /** Notification type. */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    /** Related asset identifier, if any. */
    @Column
    private java.util.UUID assetId;

    /** Whether the notification has been read. */
    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    /** UTC creation timestamp. */
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
