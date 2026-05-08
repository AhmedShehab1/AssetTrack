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

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock UserMapper userMapper;
    @Mock SecurityUtils securityUtils;
    @Mock Authentication authentication;

    @InjectMocks UserService userService;

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
        return new UserResponse(id, email, "DEVELOPER", true, LocalDateTime.now(, java.time.LocalDateTime.now(), "Test User"));
    }

    // ── getMyProfile() ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getMyProfile()")
    class GetMyProfile {

        @Test
        @DisplayName("returns profile of authenticated user")
        void success() {
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.getMyProfile(authentication);

            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void notFound() {
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

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
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");
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
            User inactive = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            inactive.setActive(false);
            UserResponse response = new UserResponse(java.util.UUID.randomUUID(), "bob@example.com", "DEVELOPER", false, LocalDateTime.now(, java.time.LocalDateTime.now(), "Test User"));
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
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.getUserById(java.util.UUID.randomUUID());

            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException for unknown id")
        void notFound() {
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(java.util.UUID.randomUUID()))
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
            User user = buildUser(java.util.UUID.randomUUID(), "old@example.com");
            UpdateEmailRequest req = request("new@example.com", "Password1");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "new@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
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
            User user = buildUser(java.util.UUID.randomUUID(), "old@example.com");
            UpdateEmailRequest req = request("new@example.com", "WrongPass");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> userService.updateEmail(req, authentication))
                    .isInstanceOf(InvalidPasswordException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws EmailAlreadyExistsException when new email is taken")
        void emailTaken() {
            User user = buildUser(java.util.UUID.randomUUID(), "old@example.com");
            UpdateEmailRequest req = request("taken@example.com", "Password1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
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

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

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
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            UpdatePasswordRequest req = request("Password1", "NewPassword1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
            when(passwordEncoder.encode("NewPassword1")).thenReturn("new-hashed");

            userService.updatePassword(req, authentication);

            assertThat(user.getPasswordHash()).isEqualTo("new-hashed");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws InvalidPasswordException on wrong current password")
        void wrongPassword() {
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            UpdatePasswordRequest req = request("WrongPass", "NewPassword1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> userService.updatePassword(req, authentication))
                    .isInstanceOf(InvalidPasswordException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            UpdatePasswordRequest req = request("Password1", "NewPassword1");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

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
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = userService.updateUserRole(java.util.UUID.randomUUID(), "ADMIN", authentication);

            assertThat(user.getRole()).isEqualTo(Role.ADMIN);
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws InvalidRoleException for unknown role")
        void invalidRole() {
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            assertThatThrownBy(() -> userService.updateUserRole(java.util.UUID.randomUUID(), "SUPERUSER", authentication))
                    .isInstanceOf(InvalidRoleException.class);
        }

        @Test
        @DisplayName("throws SelfOperationException when admin changes own role")
        void selfRole() {
            User user = buildUser(java.util.UUID.randomUUID(), "admin@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            assertThatThrownBy(() -> userService.updateUserRole(java.util.UUID.randomUUID(), "MANAGER", authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUserRole(java.util.UUID.randomUUID(), "ADMIN", authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("role matching is case-insensitive")
        void caseInsensitiveRole() {
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserRole(java.util.UUID.randomUUID(), "admin", authentication);

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
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserStatus(java.util.UUID.randomUUID(), false, authentication);

            assertThat(user.isActive()).isFalse();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("activates user successfully")
        void activate() {
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            user.setActive(false);
            UserResponse expected = buildResponse(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.save(any())).thenReturn(user);
            when(userMapper.toResponse(user)).thenReturn(expected);

            userService.updateUserStatus(java.util.UUID.randomUUID(), true, authentication);

            assertThat(user.isActive()).isTrue();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws SelfOperationException when admin changes own status")
        void selfStatus() {
            User user = buildUser(java.util.UUID.randomUUID(), "admin@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            assertThatThrownBy(() -> userService.updateUserStatus(java.util.UUID.randomUUID(), false, authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUserStatus(java.util.UUID.randomUUID(), false, authentication))
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
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            user.setActive(false);

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            userService.deleteUser(java.util.UUID.randomUUID(), authentication);

            verify(userRepository).delete(user);
        }

        @Test
        @DisplayName("throws ActiveUserDeletionException when user is still active")
        void activeUser() {
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");
            user.setActive(true);

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            assertThatThrownBy(() -> userService.deleteUser(java.util.UUID.randomUUID(), authentication))
                    .isInstanceOf(ActiveUserDeletionException.class);

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("throws SelfOperationException when admin deletes own account")
        void selfDelete() {
            User user = buildUser(java.util.UUID.randomUUID(), "admin@example.com");

            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());

            assertThatThrownBy(() -> userService.deleteUser(java.util.UUID.randomUUID(), authentication))
                    .isInstanceOf(SelfOperationException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when target user not found")
        void userNotFound() {
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(java.util.UUID.randomUUID(), authentication))
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
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");

            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.of(user));

            userService.deleteSelf(authentication);

            assertThat(user.isActive()).isFalse();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            when(securityUtils.getCurrentUserId(authentication)).thenReturn(java.util.UUID.randomUUID());
            when(userRepository.findById(java.util.UUID.randomUUID())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteSelf(authentication))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}