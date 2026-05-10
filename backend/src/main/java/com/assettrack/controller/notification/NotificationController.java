package com.assettrack.controller.notification;

import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.dto.notification.NotificationPreferencesRequest;
import com.assettrack.dto.notification.NotificationPreferencesResponse;
import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.service.notification.INotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification endpoints")
public class NotificationController {

    private final INotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List my notifications", description = "Returns paginated in-app alerts for the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Notifications retrieved")
    public ResponseEntity<PagedResponse<NotificationResponse>> getNotifications(Authentication authentication, Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(notificationService.getCurrentUserNotifications(authentication, pageable)));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark notification as read", description = "Marks one of the authenticated user's notifications as read.")
    @ApiResponse(responseCode = "200", description = "Notification marked as read", content = @Content(schema = @Schema(implementation = NotificationResponse.class)))
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication));
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read")
    @ApiResponse(responseCode = "204", description = "All notifications marked as read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notification preferences")
    @ApiResponse(responseCode = "200", description = "Preferences retrieved")
    public ResponseEntity<NotificationPreferencesResponse> getPreferences(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getPreferences(authentication));
    }

    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update notification preferences")
    @ApiResponse(responseCode = "200", description = "Preferences updated")
    public ResponseEntity<NotificationPreferencesResponse> updatePreferences(
            @RequestBody @Validated NotificationPreferencesRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.updatePreferences(request, authentication));
    }
}
