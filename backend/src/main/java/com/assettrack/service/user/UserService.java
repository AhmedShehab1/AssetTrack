package com.assettrack.service.user;

import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.exception.*;
import com.assettrack.mapper.user.UserMapper;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper ;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @param authentication the current user's authentication token
     * @return the {@link UserResponse} DTO
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     */
    public UserResponse getMyProfile(Authentication authentication) {
        long currentId = securityUtils.getCurrentUserId(authentication);
        User user = userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        return userMapper.toResponse(user);
    }

    /**
     * Retrieves a paginated list of all users.
     *
     * @param pageable pagination and sorting parameters
     * @return a page of {@link UserResponse} DTOs
     */
    public Page<UserResponse> getAllUsers(Pageable pageable){
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::toResponse);
    }

    /**
     * Retrieves a paginated list of all inactive users.
     * Used by admins to review deactivated accounts before permanent deletion.
     *
     * @param pageable pagination and sorting parameters
     * @return a page of {@link UserResponse} DTOs representing inactive users
     */
    public Page<UserResponse> getInactiveUsers(Pageable pageable){
        Page<User> users = userRepository.findAllByIsActiveFalse(pageable);
        return users.map(userMapper::toResponse);
    }

    /**
     * Retrieves a single user by their ID.
     *
     * @param id the target user's ID
     * @return the {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     */
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    /**
     * Updates the email address of the currently authenticated user.
     * Requires password confirmation before applying the change.
     *
     * @param request contains the new email and current password for verification
     * @param authentication the current user's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     * @throws InvalidPasswordException if the provided password does not match
     * @throws EmailAlreadyExistsException if the new email is already in use
     */
    public UserResponse updateEmail(UpdateEmailRequest request, Authentication authentication){
        long currentId = securityUtils.getCurrentUserId(authentication);
        User user =  userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        if(!passwordEncoder.matches(request.getPassword(),user.getPasswordHash())){
            throw new InvalidPasswordException("Invalid password");
        }
        if(userRepository.existsByEmail(request.getNewEmail())){
            throw new EmailAlreadyExistsException("Email already exists");
        }
        user.setEmail(request.getNewEmail());
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    /**
     * Updates the password of the currently authenticated user.
     * Requires the current password for verification before applying the change.
     * The new password is encoded before storage.
     *
     * @param request contains the current password and the new password
     * @param authentication the current user's authentication token
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     * @throws InvalidPasswordException if the current password does not match
     */
    public void updatePassword(UpdatePasswordRequest request, Authentication authentication){
        long currentId = securityUtils.getCurrentUserId(authentication);
        User user =  userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        if(!passwordEncoder.matches(request.getCurrentPassword(),user.getPasswordHash())){
            throw new InvalidPasswordException("Invalid password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Updates the role of a target user.
     * Admin cannot change their own role.
     *
     * @param id the target user's ID
     * @param role the new role as a string (case-insensitive)
     * @param authentication the current admin's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     * @throws InvalidRoleException if the provided role string is not a valid {@link Role}
     * @throws SelfOperationException if the admin attempts to change their own role
     */
    public UserResponse updateUserRole(Long id, String role, Authentication authentication){

        User user =  userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        long currentId = securityUtils.getCurrentUserId(authentication);
        Role roleEnum;
        try {
            roleEnum = Role.valueOf(role.toUpperCase());
        }catch (IllegalArgumentException e){
            throw new InvalidRoleException("Invalid role");
        }
        if (id.equals(currentId)) {
            throw new SelfOperationException("Admin cannot change his Role");
        }
        user.setRole(roleEnum);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    /**
     * Updates the active status of a target user.
     * Admin cannot change their own status.
     * Deactivating a user prevents them from logging in.
     *
     * @param id the target user's ID
     * @param active the new status — true to activate, false to deactivate
     * @param authentication the current admin's authentication token
     * @return the updated {@link UserResponse} DTO
     * @throws ResourceNotFoundException if no user exists with the given ID
     * @throws SelfOperationException if the admin attempts to change their own status
     */
    public UserResponse updateUserStatus(Long id, boolean active, Authentication authentication){
        User user =  userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        long currentId = securityUtils.getCurrentUserId(authentication);
        if (id.equals(currentId)) {
            throw new SelfOperationException("Admin cannot change their own status");
        }
        user.setActive(active);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    /**
     * Soft-deletes the currently authenticated user's own account
     * by setting their status to inactive.
     * The record is retained in the database for audit purposes.
     *
     * @param authentication the current user's authentication token
     * @throws ResourceNotFoundException if the authenticated user no longer exists
     */
    public void deleteSelf(Authentication authentication){
        long currentId = securityUtils.getCurrentUserId(authentication);
        User user =  userRepository.findById(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentId));
        user.setActive(false);
        userRepository.save(user);
    }

    /**
     * Permanently deletes a user from the database.
     * Only inactive users can be hard-deleted.
     * Admin cannot delete their own account via this method.
     *
     * @param id the target user's ID
     * @param authentication the current admin's authentication token
     * @throws ResourceNotFoundException if no user exists with the given ID
     * @throws SelfOperationException if the admin attempts to delete their own account
     * @throws ActiveUserDeletionException if the target user is still active
     */
    public void deleteUser(Long id, Authentication authentication){
        User user =  userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        long currentId = securityUtils.getCurrentUserId(authentication);
        if (id.equals(currentId)) {
            throw new SelfOperationException("Admin cannot delete their own account");
        }
        if (user.isActive()) {
            throw new ActiveUserDeletionException("Cannot delete an active user. Deactivate first.");
        }
        userRepository.delete(user);
    }

}
