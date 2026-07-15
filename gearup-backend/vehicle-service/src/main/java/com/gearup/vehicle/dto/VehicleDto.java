package com.gearup.vehicle.dto;

import com.gearup.vehicle.entity.Vehicle.VehicleType;
import lombok.*;
import java.time.LocalDate;

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
    private LocalDate lastServicedDate;
    private Integer mileage;
    private LocalDate insuranceExpiry;
    private LocalDate roadworthyExpiry;
    private String notes;
}