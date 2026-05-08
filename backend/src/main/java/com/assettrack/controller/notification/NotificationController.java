package com.assettrack.controller.notification;

import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.service.notification.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List my notifications", description = "Returns in-app alerts for the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Notifications retrieved")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getCurrentUserNotifications(authentication));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark notification as read", description = "Marks one of the authenticated user's notifications as read.")
    @ApiResponse(responseCode = "200", description = "Notification marked as read",
            content = @Content(schema = @Schema(implementation = NotificationResponse.class)))
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable java.util.UUID notificationId,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication));
    }
}
