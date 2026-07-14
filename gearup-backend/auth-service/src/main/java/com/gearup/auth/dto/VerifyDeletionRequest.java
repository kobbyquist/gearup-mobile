package com.gearup.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyDeletionRequest {

    @NotBlank(message = "Code is required")
    private String code;
}