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
        return mapOrderToDto(saved);
    }

    // ---------- Mechanic-facing order management ----------

    public List<PartOrderDto> getOrdersForPart(Long sellerId, Long partId) {
        SparePart part = sparePartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));
        if (!part.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        return partOrderRepository.findByPartId(partId)
                .stream().map(this::mapOrderToDto).collect(Collectors.toList());
    }

    public PartOrderDto getOrderById(Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapOrderToDto(order);
    }

    /**
     * Accepting one order reserves the part and automatically declines every other
     * still-pending order for the same part — matching "available until the mechanic
     * picks a buyer" rather than a strict first-come-first-served lock.
     */
    public PartOrderDto acceptOrder(Long sellerId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.PENDING) {
            throw new RuntimeException("This order is no longer pending");
        }
        order.setStatus(com.gearup.parts.entity.PartOrder.OrderStatus.ACCEPTED);
        partOrderRepository.save(order);

        SparePart part = sparePartRepository.findById(order.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found"));
        part.setStatus(PartStatus.RESERVED);
        sparePartRepository.save(part);

        partOrderRepository.findByPartId(order.getPartId()).stream()
                .filter(o -> !o.getId().equals(order.getId()))
                .filter(o -> o.getStatus() == com.gearup.parts.entity.PartOrder.OrderStatus.PENDING)
                .forEach(o -> {
                    o.setStatus(com.gearup.parts.entity.PartOrder.OrderStatus.DECLINED);
                    partOrderRepository.save(o);
                });

        return mapOrderToDto(order);
    }

    public PartOrderDto declineOrder(Long sellerId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.PENDING) {
            throw new RuntimeException("This order is no longer pending");
        }
        order.setStatus(com.gearup.parts.entity.PartOrder.OrderStatus.DECLINED);
        return mapOrderToDto(partOrderRepository.save(order));
    }

    public PartOrderDto cancelOrder(Long buyerId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.PENDING) {
            throw new RuntimeException("This order can no longer be cancelled");
        }
        order.setStatus(com.gearup.parts.entity.PartOrder.OrderStatus.CANCELLED);
        return mapOrderToDto(partOrderRepository.save(order));
    }

    /**
     * Marking an order complete is the final step, expected to run after payment —
     * this method itself doesn't touch payment-service, matching how job completion
     * and payment are two separate steps in the existing Job flow.
     */
    public PartOrderDto completeOrder(Long sellerId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.ACCEPTED) {
            throw new RuntimeException("This order must be accepted before it can be completed");
        }
        order.setStatus(com.gearup.parts.entity.PartOrder.OrderStatus.COMPLETED);
        partOrderRepository.save(order);

        SparePart part = sparePartRepository.findById(order.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found"));
        part.setStatus(PartStatus.SOLD);
        sparePartRepository.save(part);

        return mapOrderToDto(order);
    }

    // ---------- Price negotiation ----------

    public PartOrderDto proposePrice(Long userId, Long orderId, Double proposedPrice) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.PENDING
                && order.getStatus() != com.gearup.parts.entity.PartOrder.OrderStatus.ACCEPTED) {
            throw new RuntimeException("This order can no longer be negotiated");
        }
        order.setProposedPrice(proposedPrice);
        order.setProposedByUserId(userId);
        return mapOrderToDto(partOrderRepository.save(order));
    }

    public PartOrderDto acceptProposedPrice(Long userId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getProposedPrice() == null) {
            throw new RuntimeException("No price proposal to accept");
        }
        if (order.getProposedByUserId().equals(userId)) {
            throw new RuntimeException("You cannot accept your own price proposal");
        }
        order.setPrice(order.getProposedPrice());
        order.setProposedPrice(null);
        order.setProposedByUserId(null);
        return mapOrderToDto(partOrderRepository.save(order));
    }

    public PartOrderDto rejectProposedPrice(Long userId, Long orderId) {
        com.gearup.parts.entity.PartOrder order = partOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setProposedPrice(null);
        order.setProposedByUserId(null);
        return mapOrderToDto(partOrderRepository.save(order));
    }

    private PartOrderDto mapOrderToDto(com.gearup.parts.entity.PartOrder order) {
        return PartOrderDto.builder()
                .id(order.getId())
                .partId(order.getPartId())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .partName(order.getPartName())
                .price(order.getPrice())
                .status(order.getStatus())
                .proposedPrice(order.getProposedPrice())
                .proposedByUserId(order.getProposedByUserId())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public List<SparePartDto> getAvailableParts() {
        return sparePartRepository.findByStatus(PartStatus.AVAILABLE)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PartOrderDto> getMyOrders(Long buyerId) {
        return partOrderRepository.findByBuyerId(buyerId)
                .stream().map(this::mapOrderToDto).collect(Collectors.toList());
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