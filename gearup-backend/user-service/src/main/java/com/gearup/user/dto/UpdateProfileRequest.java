package com.gearup.user.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String profileImage;
    private String bio;
    private String location;
    private Double latitude;
    private Double longitude;
}