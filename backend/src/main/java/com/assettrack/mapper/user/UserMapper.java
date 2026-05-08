package com.assettrack.mapper.user;

import com.assettrack.domain.user.User;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.dto.user.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "fullName", expression = "java(resolveFullName(user))")
    UserSummary toSummary(User user);

    @Mapping(target = "fullName", expression = "java(resolveFullName(user))")
    @Mapping(target = "active", source = "active")
    UserResponse toResponse(User user);

    default String resolveFullName(User user) {
        if (user == null) {
            return null;
        }
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? null : fullName;
    }
}
