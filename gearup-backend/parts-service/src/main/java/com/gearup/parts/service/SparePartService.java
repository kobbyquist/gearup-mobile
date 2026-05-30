package com.gearup.parts.service;

import com.gearup.parts.dto.CreateSparePartRequest;
import com.gearup.parts.dto.SparePartDto;
import com.gearup.parts.entity.SparePart;
import com.gearup.parts.entity.SparePart.PartStatus;
import com.gearup.parts.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SparePartService {

    private final SparePartRepository sparePartRepository;

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
                .build();

        return mapToDto(sparePartRepository.save(part));
    }

    public List<SparePartDto> getAvailableParts() {
        return sparePartRepository.findByStatus(PartStatus.AVAILABLE)
                .stream().map(this::mapToDto).collect(Collectors.toList());
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
                .status(part.getStatus())
                .createdAt(part.getCreatedAt())
                .build();
    }
}