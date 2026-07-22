package com.gearup.payment.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepositVerifyRequest {

    @NotBlank(message = "Paystack reference is required")
    private String reference;

    // What the client claims was deposited — cross-checked against Paystack's verified amount
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}