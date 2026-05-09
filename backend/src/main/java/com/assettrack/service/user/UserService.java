package com.assettrack.service.user;

import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.exception.ActiveUserDeletionException;
import com.assettrack.exception.EmailAlreadyExistsException;
import com.assettrack.exception.InvalidPasswordException;
import com.assettrack.exception.InvalidRoleException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.exception.SelfOperationException;
import com.assettrack.mapper.user.UserMapper;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * User service for account and profile operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements IUserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @param authentication current authentication token
     * @return authenticated user's profile
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     */
    public UserResponse getMyProfile(Authentication authentication) {
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        log.debug("Fetching profile for user {}", currentId);
        User user = userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        log.info("Profile retrieved for user {} ({})", user.getEmail(), currentId);
        return userMapper.toResponse(user);
    }

    /**
     * Retrieves a paginated list of all users.
     *
     * @param pageable pagination and sorting parameters
     * @return a page of {@link UserResponse} DTOs
     */
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    /**
     * Retrieves a paginated list of all inactive users.
     *
     * @param pageable pagination and sorting parameters
     * @return a page of inactive users
     */
    public Page<UserResponse> getInactiveUsers(Pageable pageable) {
        return userRepository.findAllByIsActiveFalse(pageable).map(userMapper::toResponse);
    }

    /**
     * Retrieves a single user by their ID.
     *
     * @param id the target user's ID
     * @return the {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     */
    public UserResponse getUserById(java.util.UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /**
     * Updates the email address of the currently authenticated user.
     *
     * @param request        contains the new email and current password for
     *                       verification
     * @param authentication the current user's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException   if the authenticated user no longer
     *                                     exists
     * @throws InvalidPasswordException    if the provided password does not match
     * @throws EmailAlreadyExistsException if the new email is already in use
     */
    public UserResponse updateEmail(UpdateEmailRequest request, Authentication authentication) {
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        log.info("Updating email for user {}", currentId);
        User user = userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Email update rejected due to invalid password for user {}", currentId);
            throw new InvalidPasswordException("Invalid password");
        }
        if (userRepository.existsByEmail(request.getNewEmail())) {
            log.warn("Email update rejected because email already exists: {}", request.getNewEmail());
            throw new EmailAlreadyExistsException("Email already exists");
        }
        user.setEmail(request.getNewEmail());
        userRepository.save(user);
        log.info("Email updated successfully for user {}", currentId);
        return userMapper.toResponse(user);
    }

    /**
     * Updates the password of the currently authenticated user.
     *
     * @param request        contains the current password and the new password
     * @param authentication the current user's authentication token
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     * @throws InvalidPasswordException  if the current password does not match
     */
    public void updatePassword(UpdatePasswordRequest request, Authentication authentication) {
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        log.info("Updating password for user {}", currentId);
        User user = userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            log.warn("Password update rejected due to invalid current password for user {}", currentId);
            throw new InvalidPasswordException("Invalid password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated successfully for user {}", currentId);
    }

    /**
     * Updates the role of a target user.
     *
     * @param id             the target user's ID
     * @param role           the new role as a string (case-insensitive)
     * @param authentication the current admin's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     * @throws InvalidRoleException      if the provided role string is not valid
     * @throws SelfOperationException    if the admin attempts to change their own
     *                                   role
     */
    public UserResponse updateUserRole(java.util.UUID id, String role, Authentication authentication) {
        log.info("Updating role for user {} to {}", id, role);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        Role roleEnum;
        try {
            roleEnum = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role '{}' requested for user {}", role, id);
            throw new InvalidRoleException("Invalid role");
        }
        if (id.equals(currentId)) {
            log.warn("Self role change rejected for admin user {}", currentId);
            throw new SelfOperationException("Admin cannot change his Role");
        }
        user.setRole(roleEnum);
        userRepository.save(user);
        log.info("Role updated successfully for user {}", id);
        return userMapper.toResponse(user);
    }

    /**
     * Updates the active status of a target user.
     *
     * @param id             the target user's ID
     * @param active         the new status
     * @param authentication the current admin's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     * @throws SelfOperationException    if the admin attempts to change their own
     *                                   status
     */
    public UserResponse updateUserStatus(java.util.UUID id, boolean active, Authentication authentication) {
        log.info("Updating status for user {} to {}", id, active);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        if (id.equals(currentId)) {
            log.warn("Self status change rejected for admin user {}", currentId);
            throw new SelfOperationException("Admin cannot change their own status");
        }
        user.setActive(active);
        userRepository.save(user);
        log.info("Status updated successfully for user {}", id);
        return userMapper.toResponse(user);
    }

    /**
     * Soft-deletes the currently authenticated user's own account.
     *
     * @param authentication the current user's authentication token
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     */
    public void deleteSelf(Authentication authentication) {
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        log.info("Soft deleting own account for user {}", currentId);
        User user = userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        user.setActive(false);
        userRepository.save(user);
        log.info("Account deactivated for user {}", currentId);
    }

    /**
     * Permanently deletes a user from the database.
     *
     * @param id             the target user's ID
     * @param authentication the current admin's authentication token
     * @throws ResourceNotFoundException   if no user exists with the given ID
     * @throws SelfOperationException      if the admin attempts to delete their own
     *                                     account
     * @throws ActiveUserDeletionException if the target user is still active
     */
    public void deleteUser(java.util.UUID id, Authentication authentication) {
        log.info("Deleting user {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        java.util.UUID currentId = securityUtils.getCurrentUserId(authentication);
        if (id.equals(currentId)) {
            log.warn("Self deletion rejected for admin user {}", currentId);
            throw new SelfOperationException("Admin cannot delete their own account");
        }
        if (user.isActive()) {
            log.warn("Deletion rejected because user {} is still active", id);
            throw new ActiveUserDeletionException("Cannot delete an active user. Deactivate first.");
        }
        userRepository.delete(user);
        log.info("User {} deleted successfully", id);
    }
}
