package com.gearup.auth.dto;

import com.gearup.auth.entity.User.Role;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$",
        message = "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Verification code is required")
    private String code;
}