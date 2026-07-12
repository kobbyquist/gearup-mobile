package com.gearup.user.dto;

import com.gearup.user.entity.User.Role;
import lombok.*;
import java.time.LocalTime;

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
    private Double latitude;
    private Double longitude;
    private boolean acceptingBookings;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
}