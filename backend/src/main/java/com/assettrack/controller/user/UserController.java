package com.assettrack.controller.user;

import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management and self-service endpoints")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my profile", description = "Returns the authenticated user's profile")
    @ApiResponse(responseCode = "200", description = "Profile retrieved",
            content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication){
        UserResponse response = userService.getMyProfile(authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users", description = "Returns a paginated list of all users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Users retrieved")
    @ApiResponse(responseCode = "403", description = "Forbidden – Admin role required")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable){
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List inactive users", description = "Returns a paginated list of deactivated users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Inactive users retrieved")
    @ApiResponse(responseCode = "403", description = "Forbidden – Admin role required")
    public ResponseEntity<Page<UserResponse>> getInActiveUsers(Pageable pageable){
        return  ResponseEntity.ok(userService.getInactiveUsers(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Returns a single user by their ID (Admin only)")
    @ApiResponse(responseCode = "200", description = "User found",
            content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserResponse> getUser(@Parameter(description = "User ID") @PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/me/email")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my email", description = "Updates the authenticated user's email address")
    @ApiResponse(responseCode = "200", description = "Email updated",
            content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "409", description = "Email already taken")
    public ResponseEntity<UserResponse> updateEmail(@RequestBody @Validated UpdateEmailRequest request, Authentication authentication){
        return ResponseEntity.ok(userService.updateEmail(request, authentication));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my password", description = "Changes the authenticated user's password")
    @ApiResponse(responseCode = "204", description = "Password updated")
    @ApiResponse(responseCode = "400", description = "Invalid current password")
    public ResponseEntity<Void> updatePassword(@RequestBody @Validated UpdatePasswordRequest request,Authentication authentication){
        userService.updatePassword(request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Changes a user's role (Admin only)")
    @ApiResponse(responseCode = "200", description = "Role updated",
            content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    @ApiResponse(responseCode = "400", description = "Invalid role")
    public ResponseEntity<UserResponse> updateUserRole(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Parameter(description = "New role (ADMIN, MANAGER, DEVELOPER)") @RequestParam String role,
            Authentication authentication){
        return ResponseEntity.ok(userService.updateUserRole(id, role, authentication));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Activates or deactivates a user (Admin only)")
    @ApiResponse(responseCode = "200", description = "Status updated",
            content = @Content(schema = @Schema(implementation = UserResponse.class)))
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<UserResponse> updateUserStatus(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Parameter(description = "Active status") @RequestParam boolean active,
            Authentication authentication){
        return ResponseEntity.ok(userService.updateUserStatus(id, active, authentication));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete my account", description = "Permanently deletes the authenticated user's account")
    @ApiResponse(responseCode = "204", description = "Account deleted")
    public ResponseEntity<Void> deleteAccount(Authentication authentication){
        userService.deleteSelf(authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Permanently deletes a user by ID (Admin only)")
    @ApiResponse(responseCode = "204", description = "User deleted")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id,
            Authentication authentication){
        userService.deleteUser(id, authentication);
        return ResponseEntity.noContent().build();
    }

}
