package com.medicare.mapper;

import com.medicare.dto.response.UserResponseDTO;
import com.medicare.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "role.id", target = "roleId")
    @Mapping(source = "role.roleName", target = "roleName") // Map dữ liệu từ bảng Roles lồng bên trong
    UserResponseDTO toUserResponseDTO(User user);
}
