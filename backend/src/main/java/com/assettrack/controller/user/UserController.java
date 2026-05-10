package com.assettrack.controller.user;

import com.assettrack.domain.user.Role;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UpdateUserRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.service.asset.IAssetService;
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

@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and self-service endpoints")
public class UserController {
    private final IUserService userService;
    private final IAssetService assetService;
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
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(userService.listUsers(search, role, active, pageable)));
    }

    @GetMapping("/users/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List inactive users", description = "Returns a paginated list of deactivated users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Inactive users retrieved")
    @ApiResponse(responseCode = "403", description = "Forbidden – Admin role required")
    public ResponseEntity<PagedResponse<UserResponse>> getInActiveUsers(Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(userService.getInactiveUsers(pageable)));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get user by ID", description = "Returns a single user by their ID")
    @ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserResponse> getUser(@Parameter(description = "User ID") @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/auth/me/email")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my email", description = "Updates the authenticated user's email address")
    @ApiResponse(responseCode = "200", description = "Email updated", content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "409", description = "Email already taken")
    public ResponseEntity<UserResponse> updateEmail(@RequestBody @Validated UpdateEmailRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateEmail(request, authentication));
    }

    @PatchMapping("/auth/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my password", description = "Changes the authenticated user's password")
    @ApiResponse(responseCode = "204", description = "Password updated")
    @ApiResponse(responseCode = "400", description = "Invalid current password")
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
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        userService.deleteSelf(authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Permanently deletes a user by ID (Admin only)")
    @ApiResponse(responseCode = "204", description = "User deleted")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable UUID id,
            Authentication authentication) {
        userService.deleteUser(id, authentication);
        return ResponseEntity.noContent().build();
    }


    // Add PATCH /users/{id}
    @PatchMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody @Validated UpdateUserRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUser(id, request, authentication));
    }

    // Add GET /users/{userId}/assets
    @GetMapping("/users/{id}/assets")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PagedResponse<AssetResponse>> getUserAssets(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(assetService.getAssetsForUser(id, pageable)));
    }

    @GetMapping("/search/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PagedResponse<UserResponse>> searchUsers(
            @RequestParam String q,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(userService.searchUsers(q, role, active, pageable)));
    }
}
