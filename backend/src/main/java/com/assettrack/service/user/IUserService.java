package com.assettrack.service.user;

import com.assettrack.domain.user.Role;
import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UpdateUserRequest;
import com.assettrack.dto.user.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface IUserService {
    UserResponse getMyProfile(Authentication authentication);

    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> getInactiveUsers(Pageable pageable);

    UserResponse getUserById(UUID id);

    UserResponse updateEmail(UpdateEmailRequest request, Authentication authentication);

    void updatePassword(UpdatePasswordRequest request, Authentication authentication);

    UserResponse updateUserRole(UUID id, String role, Authentication authentication);

    UserResponse updateUserStatus(UUID id, boolean active, Authentication authentication);

    void deleteSelf(Authentication authentication);

    void deleteUser(UUID id, Authentication authentication);

    // GET /users — filtered list
    Page<UserResponse> listUsers(String search, Role role, Boolean active, Pageable pageable);

    // PATCH /users/{userId} — partial update (fullName + active)
    UserResponse updateUser(UUID id, UpdateUserRequest request, Authentication authentication);

    // GET /search/users
    Page<UserResponse> searchUsers(String q, Role role, Boolean active, Pageable pageable);
}