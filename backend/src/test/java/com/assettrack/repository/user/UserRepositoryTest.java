package com.assettrack.repository.user;

import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User buildUser(String email) {
        return User.builder()
                .email(email)
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build();
    }

    @Test
    void findByEmail_WhenUserExists_ReturnsUser() {
        userRepository.save(buildUser("alice@example.com"));

        Optional<User> result = userRepository.findByEmail("alice@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void findByEmail_WhenUserDoesNotExist_ReturnsEmpty() {
        Optional<User> result = userRepository.findByEmail("nonexistent@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    void existsByEmail_WhenUserExists_ReturnsTrue() {
        userRepository.save(buildUser("bob@example.com"));

        assertThat(userRepository.existsByEmail("bob@example.com")).isTrue();
    }

    @Test
    void existsByEmail_WhenUserDoesNotExist_ReturnsFalse() {
        assertThat(userRepository.existsByEmail("ghost@example.com")).isFalse();
    }

    @Test
    void save_DuplicateEmail_ThrowsDataIntegrityViolationException() {
        userRepository.save(buildUser("carol@example.com"));

        assertThatThrownBy(() -> {
            userRepository.saveAndFlush(buildUser("carol@example.com"));
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
