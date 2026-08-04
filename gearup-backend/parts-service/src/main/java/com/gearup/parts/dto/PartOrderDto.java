package com.gearup.parts.dto;

import com.gearup.parts.entity.PartOrder.OrderStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartOrderDto {
    private Long id;
    private Long partId;
    private Long buyerId;
    private Long sellerId;
    private String partName;
    private Double price;
    private OrderStatus status;
    private Double proposedPrice;
    private Long proposedByUserId;
    private LocalDateTime createdAt;
}