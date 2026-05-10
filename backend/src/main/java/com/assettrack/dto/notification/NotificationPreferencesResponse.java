package com.assettrack.dto.notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationPreferencesResponse(
        UUID userId,
        Integer warrantyExpiryDaysThreshold,
        Integer lowStockThreshold,
        Boolean emailNotificationsEnabled,
        Boolean inAppNotificationsEnabled,
        LocalDateTime updatedAt
) {}