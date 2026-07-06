package com.gearup.parts.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProposePartPriceRequest {

    @NotNull(message = "Proposed price is required")
    @Positive(message = "Proposed price must be positive")
    private Double proposedPrice;
}