package com.gearup.payment.dto;

import com.gearup.payment.entity.WalletTransaction.TransactionStatus;
import com.gearup.payment.entity.WalletTransaction.TransactionType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransactionDto {
    private Long id;
    private Long walletId;
    private TransactionType type;
    private Double amount;
    private Double balanceAfter;
    private String paystackReference;
    private Long jobId;
    private Long paymentId;
    private TransactionStatus status;
    private String description;
    private LocalDateTime createdAt;
}