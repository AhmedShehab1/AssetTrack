package com.assettrack.mapper.auth;

import com.assettrack.domain.user.User;
import com.assettrack.dto.auth.AuthResponse;
import org.mapstruct.Mapper;

import com.assettrack.mapper.user.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for authentication responses.
 */
@Mapper(componentModel = "spring", uses = { UserMapper.class })
public abstract class AuthMapper {
    @Autowired
    protected UserMapper userMapper;

    public AuthResponse toResponse(String token, User user) {
        return new AuthResponse(token, "Bearer", 86400, userMapper.toSummary(user));
    }
}