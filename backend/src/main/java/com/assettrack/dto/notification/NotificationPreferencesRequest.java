package com.assettrack.dto.notification;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record NotificationPreferencesRequest(
        @Min(1) @Max(365)
        Integer warrantyExpiryDaysThreshold,

        @Min(0)
        Integer lowStockThreshold,

        Boolean emailNotificationsEnabled,
        Boolean inAppNotificationsEnabled
) {}