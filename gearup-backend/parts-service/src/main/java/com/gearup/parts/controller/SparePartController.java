package com.gearup.parts.controller;

import com.gearup.parts.dto.CreateSparePartRequest;
import com.gearup.parts.dto.SparePartDto;
import com.gearup.parts.security.JwtService;
import com.gearup.parts.service.SparePartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class SparePartController {

    private final SparePartService sparePartService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<SparePartDto> createListing(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateSparePartRequest request) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.createListing(sellerId, request));
    }

    @GetMapping("/available")
    public ResponseEntity<List<SparePartDto>> getAvailableParts() {
        return ResponseEntity.ok(sparePartService.getAvailableParts());
    }

    @GetMapping("/my")
    public ResponseEntity<List<SparePartDto>> getMyListings(
            @RequestHeader("Authorization") String authHeader) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.getMyListings(sellerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SparePartDto>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String carMake) {
        if (name != null) {
            return ResponseEntity.ok(sparePartService.searchByName(name));
        } else if (carMake != null) {
            return ResponseEntity.ok(sparePartService.searchByCarMake(carMake));
        }
        return ResponseEntity.ok(sparePartService.getAvailableParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SparePartDto> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(sparePartService.getPartById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SparePartDto> updateListing(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody CreateSparePartRequest request) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.updateListing(id, sellerId, request));
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<SparePartDto> markAsSold(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.markAsSold(id, sellerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long sellerId = extractUserId(authHeader);
        sparePartService.deleteListing(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}