package com.assettrack.mapper.user;

import com.assettrack.domain.user.User;
import com.assettrack.dto.user.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "fullName", expression = "java(user.getFirstName() != null || user.getLastName() != null ? (user.getFirstName() != null ? user.getFirstName() + \" \" : \"\") + (user.getLastName() != null ? user.getLastName() : \"\").trim() : null)")
    UserResponse toResponse(User user);
}
