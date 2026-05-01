package com.assettrack.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
})
@AutoConfigureMockMvc
public class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

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
                .with(jwt().jwt(jwt -> jwt.claim("role", "ADMIN")).authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }
}