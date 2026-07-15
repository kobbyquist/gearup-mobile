package com.gearup.vehicle.dto;

import com.gearup.vehicle.entity.Vehicle.VehicleType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateVehicleRequest {

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotBlank(message = "License plate is required")
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