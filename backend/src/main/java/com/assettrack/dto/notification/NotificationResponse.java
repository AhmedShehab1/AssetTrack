package com.assettrack.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private java.util.UUID id;
    private String recipient;
    private String messageBody;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;
}
