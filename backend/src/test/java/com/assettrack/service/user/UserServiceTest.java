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
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    UserRepository userRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    UserMapper userMapper;
    @Mock
    SecurityUtils securityUtils;
    @Mock
    Authentication authentication;

    @InjectMocks
    UserService userService;

    private User buildUser(java.util.UUID id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setPasswordHash("hashed");
        u.setRole(Role.DEVELOPER);
        u.setActive(true);
        return u;
    }

    private UserResponse buildResponse(java.util.UUID id, String email) {
        return new UserResponse(id, email, "Test User", Role.DEVELOPER, LocalDateTime.now(),
                java.time.LocalDateTime.now(), true);
    }

    // ── getMyProfile() ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getMyProfile()")
    class GetMyProfile {

        @Test
        @DisplayName("returns profile of authenticated user")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");
            UserResponse expected = buildResponse(testId, "alice@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.getMyProfile(authentication);

            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void notFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getMyProfile(authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── getAllUsers() ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAllUsers()")
    class GetAllUsers {

        @Test
        @DisplayName("returns paginated list of all users")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");
            UserResponse response = buildResponse(testId, "alice@example.com");
            Pageable pageable = PageRequest.of(0, 10);
            Page<User> page = new PageImpl<>(List.of(user), pageable, 1);

            when(userRepository.findAll(pageable)).thenReturn(page);
            when(userMapper.toResponse(user)).thenReturn(response);

            Page<UserResponse> result = userService.getAllUsers(pageable);

            assertThat(result.getContent()).containsExactly(response);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("returns empty page when no users exist")
        void emptyPage() {
            Pageable pageable = PageRequest.of(0, 10);
            when(userRepository.findAll(pageable)).thenReturn(Page.empty(pageable));

            Page<UserResponse> result = userService.getAllUsers(pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }

    // ── getInactiveUsers() ────────────────────────────────────────────────────

    @Nested
    @DisplayName("getInactiveUsers()")
    class GetInactiveUsers {

        @Test
        @DisplayName("returns only inactive users")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User inactive = buildUser(testId, "bob@example.com");
            inactive.setActive(false);
            UserResponse response = new UserResponse(testId, "bob@example.com", "Test User", Role.DEVELOPER,
                    LocalDateTime.now(), java.time.LocalDateTime.now(), false);
            Pageable pageable = PageRequest.of(0, 10);
            Page<User> page = new PageImpl<>(List.of(inactive), pageable, 1);

            when(userRepository.findAllByIsActiveFalse(pageable)).thenReturn(page);
            when(userMapper.toResponse(inactive)).thenReturn(response);

            Page<UserResponse> result = userService.getInactiveUsers(pageable);

            assertThat(result.getContent()).containsExactly(response);
            assertThat(result.getContent().get(0).isActive()).isFalse();
        }

        @Test
        @DisplayName("returns empty page when all users are active")
        void emptyWhenAllActive() {
            Pageable pageable = PageRequest.of(0, 10);
            when(userRepository.findAllByIsActiveFalse(pageable)).thenReturn(Page.empty(pageable));

            Page<UserResponse> result = userService.getInactiveUsers(pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }

    // ── getUserById() ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getUserById()")
    class GetUserById {

        @Test
        @DisplayName("returns user for valid id")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");
            UserResponse expected = buildResponse(testId, "alice@example.com");

            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.getUserById(testId);

            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException for unknown id")
        void notFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(testId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── updateEmail() ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateEmail()")
    class UpdateEmail {

        private UpdateEmailRequest request(String newEmail, String password) {
            UpdateEmailRequest r = new UpdateEmailRequest();
            r.setNewEmail(newEmail);
            r.setPassword(password);
            return r;
        }

        @Test
        @DisplayName("updates email successfully")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "old@example.com");
            UpdateEmailRequest req = request("new@example.com", "Password1");
            UserResponse expected = buildResponse(testId, "new@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
            when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.updateEmail(req, authentication);

            assertThat(user.getEmail()).isEqualTo("new@example.com");
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws InvalidPasswordException on wrong password")
        void wrongPassword() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "old@example.com");
            UpdateEmailRequest req = request("new@example.com", "WrongPass");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> userService.updateEmail(req, authentication))
                    .isInstanceOf(InvalidPasswordException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws EmailAlreadyExistsException when new email is taken")
        void emailTaken() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "old@example.com");
            UpdateEmailRequest req = request("taken@example.com", "Password1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
            when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateEmail(req, authentication))
                    .isInstanceOf(EmailAlreadyExistsException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            UpdateEmailRequest req = request("new@example.com", "Password1");

            java.util.UUID testId = java.util.UUID.randomUUID();
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateEmail(req, authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── updatePassword() ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("updatePassword()")
    class UpdatePassword {

        private UpdatePasswordRequest request(String current, String newPass) {
            UpdatePasswordRequest r = new UpdatePasswordRequest();
            r.setCurrentPassword(current);
            r.setNewPassword(newPass);
            return r;
        }

        @Test
        @DisplayName("encodes and saves new password")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");
            UpdatePasswordRequest req = request("Password1", "NewPassword1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
            when(passwordEncoder.encode("NewPassword1")).thenReturn("new-hashed");

            userService.updatePassword(req, authentication);

            assertThat(user.getPasswordHash()).isEqualTo("new-hashed");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws InvalidPasswordException on wrong current password")
        void wrongPassword() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");
            UpdatePasswordRequest req = request("WrongPass", "NewPassword1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> userService.updatePassword(req, authentication))
                    .isInstanceOf(InvalidPasswordException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            UpdatePasswordRequest req = request("Password1", "NewPassword1");

            java.util.UUID testId = java.util.UUID.randomUUID();
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updatePassword(req, authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── updateUserRole() ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateUserRole()")
    class UpdateUserRole {

        @Test
        @DisplayName("updates role successfully")
        void success() {
            java.util.UUID adminId = java.util.UUID.randomUUID();
            java.util.UUID targetId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            UserResponse expected = buildResponse(targetId, "bob@example.com");

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(adminId);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.updateUserRole(targetId, "ADMIN", authentication);

            assertThat(user.getRole()).isEqualTo(Role.ADMIN);
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws InvalidRoleException for unknown role")
        void invalidRole() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "bob@example.com");

            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);

            assertThatThrownBy(() -> userService.updateUserRole(testId, "SUPERUSER", authentication))
                    .isInstanceOf(InvalidRoleException.class);
        }

        @Test
        @DisplayName("throws SelfOperationException when admin changes own role")
        void selfRole() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "admin@example.com");

            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);

            assertThatThrownBy(() -> userService.updateUserRole(testId, "MANAGER", authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUserRole(testId, "ADMIN", authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("role matching is case-insensitive")
        void caseInsensitiveRole() {
            java.util.UUID adminId = java.util.UUID.randomUUID();
            java.util.UUID targetId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            UserResponse expected = buildResponse(targetId, "bob@example.com");

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(adminId);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserRole(targetId, "admin", authentication);

            assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        }
    }

    // ── updateUserStatus() ────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateUserStatus()")
    class UpdateUserStatus {

        @Test
        @DisplayName("deactivates user successfully")
        void deactivate() {
            java.util.UUID adminId = java.util.UUID.randomUUID();
            java.util.UUID targetId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            UserResponse expected = buildResponse(targetId, "bob@example.com");

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(adminId);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserStatus(targetId, false, authentication);

            assertThat(user.isActive()).isFalse();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("activates user successfully")
        void activate() {
            java.util.UUID adminId = java.util.UUID.randomUUID();
            java.util.UUID targetId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            user.setActive(false);
            UserResponse expected = buildResponse(targetId, "bob@example.com");

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(adminId);
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserStatus(targetId, true, authentication);

            assertThat(user.isActive()).isTrue();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws SelfOperationException when admin changes own status")
        void selfStatus() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "admin@example.com");

            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);

            assertThatThrownBy(() -> userService.updateUserStatus(testId, false, authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUserStatus(testId, false, authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── deleteUser() ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteUser()")
    class DeleteUser {

        @Test
        @DisplayName("hard-deletes inactive user")
        void success() {
            java.util.UUID adminId = java.util.UUID.randomUUID();
            java.util.UUID targetId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            user.setActive(false);

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(adminId);

            userService.deleteUser(targetId, authentication);

            verify(userRepository).delete(user);
        }

        @Test
        @DisplayName("throws ActiveUserDeletionException when user is still active")
        void activeUser() {
            java.util.UUID targetId = java.util.UUID.randomUUID();
            java.util.UUID currentAdminId = java.util.UUID.randomUUID();
            User user = buildUser(targetId, "bob@example.com");
            user.setActive(true);

            when(userRepository.findById(targetId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(currentAdminId);

            assertThatThrownBy(() -> userService.deleteUser(targetId, authentication))
                    .isInstanceOf(ActiveUserDeletionException.class);

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("throws SelfOperationException when admin deletes own account")
        void selfDelete() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "admin@example.com");

            when(userRepository.findById(testId)).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);

            assertThatThrownBy(() -> userService.deleteUser(testId, authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(testId, authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── deleteSelf() ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteSelf()")
    class DeleteSelf {

        @Test
        @DisplayName("soft-deletes by setting active=false")
        void success() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            User user = buildUser(testId, "alice@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.of(user));

            userService.deleteSelf(authentication);

            assertThat(user.isActive()).isFalse();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            java.util.UUID testId = java.util.UUID.randomUUID();
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(testId);
            when(userRepository.findById(testId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteSelf(authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}