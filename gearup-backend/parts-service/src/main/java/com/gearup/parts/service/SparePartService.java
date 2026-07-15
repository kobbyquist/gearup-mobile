package com.gearup.parts.service;

import com.gearup.parts.dto.CreateSparePartRequest;
import com.gearup.parts.dto.PartOrderDto;
import com.gearup.parts.dto.SparePartDto;
import com.gearup.parts.entity.SparePart;
import com.gearup.parts.entity.SparePart.PartStatus;
import com.gearup.parts.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.gearup.parts.dto.PartOrderDto;

@Service
@RequiredArgsConstructor
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final com.gearup.parts.repository.PartOrderRepository partOrderRepository;

    public SparePartDto createListing(Long sellerId, CreateSparePartRequest request) {
        SparePart part = SparePart.builder()
                .sellerId(sellerId)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .brand(request.getBrand())
                .carMake(request.getCarMake())
                .carModel(request.getCarModel())
                .condition(request.getCondition())
                .imageUrl(request.getImageUrl())
                .build();

        return mapToDto(sparePartRepository.save(part));
    }

    public PartOrderDto createOrder(Long buyerId, Long partId) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        if (part.getStatus() != PartStatus.AVAILABLE) {
            throw new RuntimeException("This part is no longer available");
        }

        com.gearup.parts.entity.PartOrder order = com.gearup.parts.entity.PartOrder.builder()
                .partId(part.getId())
                .buyerId(buyerId)
                .sellerId(part.getSellerId())
                .partName(part.getName())
                .price(part.getPrice())
                .build();

        com.gearup.parts.entity.PartOrder saved = partOrderRepository.save(order);

        return PartOrderDto.builder()
                .id(saved.getId())
                .partId(saved.getPartId())
                .buyerId(saved.getBuyerId())
                .sellerId(saved.getSellerId())
                .partName(saved.getPartName())
                .price(saved.getPrice())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<SparePartDto> getAvailableParts() {
        return sparePartRepository.findByStatus(PartStatus.AVAILABLE)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PartOrderDto> getMyOrders(Long buyerId) {
        return partOrderRepository.findByBuyerId(buyerId)
                .stream()
                .map(o -> PartOrderDto.builder()
                        .id(o.getId())
                        .partId(o.getPartId())
                        .buyerId(o.getBuyerId())
                        .sellerId(o.getSellerId())
                        .partName(o.getPartName())
                        .price(o.getPrice())
                        .status(o.getStatus())
                        .createdAt(o.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<SparePartDto> getMyListings(Long sellerId) {
        return sparePartRepository.findBySellerId(sellerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<SparePartDto> searchByName(String name) {
        return sparePartRepository.findByNameContainingIgnoreCaseAndStatus(name, PartStatus.AVAILABLE)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<SparePartDto> searchByCarMake(String carMake) {
        return sparePartRepository.findByCarMakeIgnoreCaseAndStatus(carMake, PartStatus.AVAILABLE)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SparePartDto getPartById(Long partId) {
        return mapToDto(sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found")));
    }

    public SparePartDto updateListing(Long partId, Long sellerId, CreateSparePartRequest request) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        if (!part.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (request.getName() != null) part.setName(request.getName());
        if (request.getDescription() != null) part.setDescription(request.getDescription());
        if (request.getPrice() != null) part.setPrice(request.getPrice());
        if (request.getBrand() != null) part.setBrand(request.getBrand());
        if (request.getCarMake() != null) part.setCarMake(request.getCarMake());
        if (request.getCarModel() != null) part.setCarModel(request.getCarModel());
        if (request.getCondition() != null) part.setCondition(request.getCondition());
        if (request.getImageUrl() != null) part.setImageUrl(request.getImageUrl());

        return mapToDto(sparePartRepository.save(part));
    }

    public SparePartDto markAsSold(Long partId, Long sellerId) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        if (!part.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        part.setStatus(PartStatus.SOLD);
        return mapToDto(sparePartRepository.save(part));
    }

    public void deleteListing(Long partId, Long sellerId) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        if (!part.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        sparePartRepository.delete(part);
    }

    private SparePartDto mapToDto(SparePart part) {
        return SparePartDto.builder()
                .id(part.getId())
                .sellerId(part.getSellerId())
                .name(part.getName())
                .description(part.getDescription())
                .price(part.getPrice())
                .brand(part.getBrand())
                .carMake(part.getCarMake())
                .carModel(part.getCarModel())
                .condition(part.getCondition())
                .imageUrl(part.getImageUrl())
                .status(part.getStatus())
                .createdAt(part.getCreatedAt())
                .build();
    }
}