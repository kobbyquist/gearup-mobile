package com.gearup.parts.controller;

import com.gearup.parts.dto.CreateSparePartRequest;
import com.gearup.parts.dto.PartOrderDto;
import com.gearup.parts.dto.SparePartDto;
import com.gearup.parts.security.JwtService;
import com.gearup.parts.service.SparePartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.gearup.parts.dto.PartOrderDto;

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

    @PostMapping("/{id}/order")
    public ResponseEntity<PartOrderDto> createOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long buyerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.createOrder(buyerId, id));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<List<PartOrderDto>> getMyOrders(
            @RequestHeader("Authorization") String authHeader) {
        Long buyerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.getMyOrders(buyerId));
    }
@GetMapping("/{id}/orders")
    public ResponseEntity<List<PartOrderDto>> getOrdersForPart(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.getOrdersForPart(sellerId, id));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<PartOrderDto> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(sparePartService.getOrderById(orderId));
    }

    @PutMapping("/orders/{orderId}/accept")
    public ResponseEntity<PartOrderDto> acceptOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.acceptOrder(sellerId, orderId));
    }

    @PutMapping("/orders/{orderId}/decline")
    public ResponseEntity<PartOrderDto> declineOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.declineOrder(sellerId, orderId));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<PartOrderDto> cancelOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long buyerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.cancelOrder(buyerId, orderId));
    }

    @PutMapping("/orders/{orderId}/complete")
    public ResponseEntity<PartOrderDto> completeOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long sellerId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.completeOrder(sellerId, orderId));
    }

    @PutMapping("/orders/{orderId}/propose-price")
    public ResponseEntity<PartOrderDto> proposePrice(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId,
            @Valid @RequestBody com.gearup.parts.dto.ProposePartPriceRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.proposePrice(userId, orderId, request.getProposedPrice()));
    }

    @PutMapping("/orders/{orderId}/accept-price")
    public ResponseEntity<PartOrderDto> acceptProposedPrice(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.acceptProposedPrice(userId, orderId));
    }

    @PutMapping("/orders/{orderId}/reject-price")
    public ResponseEntity<PartOrderDto> rejectProposedPrice(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long orderId) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(sparePartService.rejectProposedPrice(userId, orderId));
    }
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) throws IOException {
        extractUserId(authHeader); // just verifying the token is valid

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String uploadsDir = new File("uploads").getAbsolutePath();
        File dir = new File(uploadsDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String extension = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        File dest = new File(dir, filename);
        file.transferTo(dest.getAbsoluteFile());

        String imageUrl = "/uploads/" + filename;
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
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