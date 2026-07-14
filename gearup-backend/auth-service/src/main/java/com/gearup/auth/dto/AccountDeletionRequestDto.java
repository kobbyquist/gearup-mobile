package com.gearup.auth.dto;

import com.gearup.auth.entity.AccountDeletionRequest.Status;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDeletionRequestDto {
    private Long id;
    private Status status;
    private LocalDateTime requestedAt;
}