package com.assettrack.controller.user;

import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.service.user.IUserService;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

/**
 * User Management Controller for AssetTrack.
 *
 * Handles user management operations including profile retrieval, user listing,
 * email/password updates,
 * and admin operations for user role and status management.
 *
 * Base URLs: {@code /api/v1/auth}, {@code /api/v1/users}
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and self-service endpoints")
public class UserController {
    private final IUserService userService;

    /**
     * Retrieves the authenticated user's profile.
     * 
     * @param authentication the authenticated user
     * @return ResponseEntity with the user's profile (HTTP 200)
     * @throws UnauthorizedException if not authenticated
     */
    @GetMapping("/auth/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my profile", description = "Returns the authenticated user's profile")
    @ApiResponse(responseCode = "200", description = "Profile retrieved", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        UserResponse response = userService.getMyProfile(authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "List all users", description = "Returns a paginated list of all users")
    @ApiResponse(responseCode = "200", description = "Users retrieved")
    @ApiResponse(responseCode = "403", description = "Forbidden")
    /**
     * Returns the user list.
     *
     * @param pageable pagination parameters
     * @return paged user response
     */
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(userService.getAllUsers(pageable)));
    }

    @GetMapping("/users/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List inactive users", description = "Returns a paginated list of deactivated users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Inactive users retrieved")
    @ApiResponse(responseCode = "403", description = "Forbidden – Admin role required")
    /**
     * Returns inactive users.
     *
     * @param pageable pagination parameters
     * @return paged inactive user response
     */
    public ResponseEntity<PagedResponse<UserResponse>> getInActiveUsers(Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(userService.getInactiveUsers(pageable)));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get user by ID", description = "Returns a single user by their ID")
    @ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    /**
     * Returns a single user by ID.
     *
     * @param id user identifier
     * @return user response
     */
    public ResponseEntity<UserResponse> getUser(@Parameter(description = "User ID") @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/auth/me/email")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my email", description = "Updates the authenticated user's email address")
    @ApiResponse(responseCode = "200", description = "Email updated", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "409", description = "Email already taken")
    /**
     * Updates the authenticated user's email address.
     *
     * @param request        new email payload
     * @param authentication current authentication context
     * @return updated user response
     */
    public ResponseEntity<UserResponse> updateEmail(@RequestBody @Validated UpdateEmailRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateEmail(request, authentication));
    }

    @PatchMapping("/auth/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my password", description = "Changes the authenticated user's password")
    @ApiResponse(responseCode = "204", description = "Password updated")
    @ApiResponse(responseCode = "400", description = "Invalid current password")
    /**
     * Updates the authenticated user's password.
     *
     * @param request        password change payload
     * @param authentication current authentication context
     * @return empty response on success
     */
    public ResponseEntity<Void> updatePassword(@RequestBody @Validated UpdatePasswordRequest request,
            Authentication authentication) {
        userService.updatePassword(request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Changes a user's role (Admin only)")
    @ApiResponse(responseCode = "200", description = "Role updated", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    @ApiResponse(responseCode = "400", description = "Invalid role")
    /**
     * Updates a user's role.
     *
     * @param id             user identifier
     * @param role           new role name
     * @param authentication current authentication context
     * @return updated user response
     */
    public ResponseEntity<UserResponse> updateUserRole(
            @Parameter(description = "User ID") @PathVariable UUID id,
            @Parameter(description = "New role (ADMIN, MANAGER, DEVELOPER)") @RequestParam String role,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserRole(id, role, authentication));
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Activates or deactivates a user (Admin only)")
    @ApiResponse(responseCode = "200", description = "Status updated", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    /**
     * Updates a user's active status.
     *
     * @param id             user identifier
     * @param active         whether the account should be active
     * @param authentication current authentication context
     * @return updated user response
     */
    public ResponseEntity<UserResponse> updateUserStatus(
            @Parameter(description = "User ID") @PathVariable UUID id,
            @Parameter(description = "Active status") @RequestParam boolean active,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserStatus(id, active, authentication));
    }

    @DeleteMapping("/auth/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete my account", description = "Permanently deletes the authenticated user's account")
    @ApiResponse(responseCode = "204", description = "Account deleted")
    /**
     * Deletes the authenticated user's account.
     *
     * @param authentication current authentication context
     * @return empty response on success
     */
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        userService.deleteSelf(authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Permanently deletes a user by ID (Admin only)")
    @ApiResponse(responseCode = "204", description = "User deleted")
    @ApiResponse(responseCode = "404", description = "User not found")
    /**
     * Deletes a user by ID.
     *
     * @param id             user identifier
     * @param authentication current authentication context
     * @return empty response on success
     */
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable UUID id,
            Authentication authentication) {
        userService.deleteUser(id, authentication);
        return ResponseEntity.noContent().build();
    }

}
