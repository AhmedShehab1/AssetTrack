package com.assettrack.domain.notification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Builder.Default
    private Integer warrantyExpiryDaysThreshold = 30;

    @Builder.Default
    private Integer lowStockThreshold = 5;

    @Builder.Default
    private boolean emailNotificationsEnabled = true;

    @Builder.Default
    private boolean inAppNotificationsEnabled = true;

    private LocalDateTime updatedAt;
}