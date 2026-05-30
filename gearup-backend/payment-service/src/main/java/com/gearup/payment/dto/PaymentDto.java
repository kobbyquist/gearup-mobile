package com.gearup.payment.dto;

import com.gearup.payment.entity.Payment.PaymentMethod;
import com.gearup.payment.entity.Payment.PaymentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {
    private Long id;
    private Long jobId;
    private Long payerId;
    private Long payeeId;
    private Double amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String reference;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}