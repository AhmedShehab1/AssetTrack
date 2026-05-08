package com.assettrack.dto.notification;

import com.assettrack.domain.notification.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String message;
    private boolean read;
    private UUID assetId;
    private LocalDateTime createdAt;

    public NotificationResponse(UUID id,
            NotificationType type,
            String message,
            boolean read,
            UUID assetId,
            LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.read = read;
        this.assetId = assetId;
        this.createdAt = createdAt;
    }
}
