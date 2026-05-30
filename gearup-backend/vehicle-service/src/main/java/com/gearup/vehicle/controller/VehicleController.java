package com.gearup.vehicle.controller;

import com.gearup.vehicle.dto.CreateVehicleRequest;
import com.gearup.vehicle.dto.VehicleDto;
import com.gearup.vehicle.security.JwtService;
import com.gearup.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<VehicleDto> addVehicle(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateVehicleRequest request) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(vehicleService.addVehicle(ownerId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<VehicleDto>> getMyVehicles(
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(vehicleService.getMyVehicles(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody CreateVehicleRequest request) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(vehicleService.updateVehicle(id, ownerId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long ownerId = extractUserId(authHeader);
        vehicleService.deleteVehicle(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}