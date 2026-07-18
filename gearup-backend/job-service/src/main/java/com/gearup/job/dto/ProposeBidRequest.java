package com.gearup.job.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProposeBidRequest {
    private Double biddingCost;
    private String biddingNote;
}