package com.gearup.payment.dto;

import com.gearup.payment.entity.BankAccount.AccountType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveBankAccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Bank code is required")
    private String bankCode;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;
    // accountName is NOT accepted here — it gets resolved from Paystack's account-resolve API
    // inside WalletService, so we never trust a user-typed name for a real bank account
}