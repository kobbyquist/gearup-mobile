package com.gearup.payment.dto;

import com.gearup.payment.entity.BankAccount.AccountType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountDto {
    private Long id;
    private Long userId;
    private AccountType accountType;
    private String bankCode;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private LocalDateTime createdAt;
    // paystackRecipientCode intentionally excluded — internal use only, never sent to frontend
}