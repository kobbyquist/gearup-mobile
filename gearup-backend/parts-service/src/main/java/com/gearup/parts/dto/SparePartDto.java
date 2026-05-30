package com.gearup.parts.dto;

import com.gearup.parts.entity.SparePart.PartStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparePartDto {
    private Long id;
    private Long sellerId;
    private String name;
    private String description;
    private Double price;
    private String brand;
    private String carMake;
    private String carModel;
    private String condition;
    private PartStatus status;
    private LocalDateTime createdAt;
}