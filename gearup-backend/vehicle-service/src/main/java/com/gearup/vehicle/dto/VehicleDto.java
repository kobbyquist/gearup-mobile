package com.gearup.vehicle.dto;

import com.gearup.vehicle.entity.Vehicle.VehicleType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDto {
    private Long id;
    private Long ownerId;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String color;
    private String description;
    private VehicleType type;
}