
package com.assettrack.dto.notification;

import com.assettrack.domain.notification.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.UUID;

/**
 * Notification response returned to the authenticated user.
 */
@Data
@NoArgsConstructor
public class NotificationResponse {
    /** Notification identifier. */
    private UUID id;
    /** Notification type. */
    private NotificationType type;
    /** Human-readable message. */
    private String message;
    /** Whether the notification has been read. */
    private boolean read;
    /** Related asset identifier, if any. */
    private UUID assetId;

    /** UTC creation timestamp. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
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
