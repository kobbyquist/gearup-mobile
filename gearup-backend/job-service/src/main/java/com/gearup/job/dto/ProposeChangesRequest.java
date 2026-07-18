package com.gearup.job.dto;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProposeChangesRequest {
    private Double proposedCost;
    private LocalDateTime proposedScheduledDate;
    private String proposedNote;
}