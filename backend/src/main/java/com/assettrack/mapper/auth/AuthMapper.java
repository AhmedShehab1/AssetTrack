package com.assettrack.mapper.auth;

import com.assettrack.domain.user.User;
import com.assettrack.dto.auth.AuthResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    default AuthResponse toResponse(String token, User user) {
        return new AuthResponse(token, user.getRole().name());
    }
}