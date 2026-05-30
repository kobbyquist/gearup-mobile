package com.gearup.user.dto;

import com.gearup.user.entity.User.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private String bio;
    private String location;
    private Role role;
}