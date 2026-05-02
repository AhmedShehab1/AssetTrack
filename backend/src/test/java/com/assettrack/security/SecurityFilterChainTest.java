package com.assettrack.security;

import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.config.TestRsaKeyConfig;
import com.assettrack.service.auth.AuthService;
import com.assettrack.service.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
        "spring.main.allow-bean-definition-overriding=true",
        "rsa.public-key-location=classpath:dummy",
        "rsa.private-key-location=classpath:dummy"
})
@AutoConfigureMockMvc
@Import(TestRsaKeyConfig.class)
public class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @Test
    public void publicEndpoint_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/auth/test"))
                .andExpect(status().isOk());
    }

    @Test
    public void protectedEndpoint_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/assets/test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void adminEndpoint_WithDeveloperRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users/test")
                .with(jwt().jwt(jwt -> jwt.claim("role", "DEVELOPER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    public void adminEndpoint_WithAdminRole_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/users/test")
                .with(jwt().jwt(jwt -> jwt.claim("role", "ADMIN"))
                        .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    public void usersEndpoint_WithManagerRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users")
                .with(jwt().jwt(jwt -> jwt.claim("role", "MANAGER"))
                        .authorities(new SimpleGrantedAuthority("ROLE_MANAGER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    public void usersEndpoint_WithAdminRole_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/users")
                .with(jwt().jwt(jwt -> jwt.claim("role", "ADMIN"))
                        .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    public void selfProfileEndpoint_WithAuthenticatedUser_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .with(jwt().jwt(jwt -> jwt.claim("role", "DEVELOPER").claim("userId", 1L))
                        .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk());
    }

    @Test
    public void selfProfileEndpoint_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}