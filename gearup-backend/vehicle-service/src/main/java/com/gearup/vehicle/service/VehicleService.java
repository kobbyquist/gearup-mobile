package com.gearup.vehicle.service;

import com.gearup.vehicle.dto.CreateVehicleRequest;
import com.gearup.vehicle.dto.VehicleDto;
import com.gearup.vehicle.entity.Vehicle;
import com.gearup.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleDto addVehicle(Long ownerId, CreateVehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .ownerId(ownerId)
                .make(request.getMake())
                .model(request.getModel())
                .year(request.getYear())
                .licensePlate(request.getLicensePlate())
                .color(request.getColor())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : Vehicle.VehicleType.CAR)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public List<VehicleDto> getMyVehicles(Long ownerId) {
        return vehicleRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return mapToDto(vehicle);
    }

    public VehicleDto updateVehicle(Long vehicleId, Long ownerId, CreateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (request.getMake() != null) vehicle.setMake(request.getMake());
        if (request.getModel() != null) vehicle.setModel(request.getModel());
        if (request.getYear() != null) vehicle.setYear(request.getYear());
        if (request.getLicensePlate() != null) vehicle.setLicensePlate(request.getLicensePlate());
        if (request.getColor() != null) vehicle.setColor(request.getColor());
        if (request.getDescription() != null) vehicle.setDescription(request.getDescription());
        if (request.getType() != null) vehicle.setType(request.getType());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public void deleteVehicle(Long vehicleId, Long ownerId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!vehicle.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        vehicleRepository.delete(vehicle);
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .ownerId(vehicle.getOwnerId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .licensePlate(vehicle.getLicensePlate())
                .color(vehicle.getColor())
                .description(vehicle.getDescription())
                .type(vehicle.getType())
                .build();
    }
}