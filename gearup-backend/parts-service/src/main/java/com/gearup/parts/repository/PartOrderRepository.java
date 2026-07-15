package com.gearup.parts.repository;

import com.gearup.parts.entity.PartOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartOrderRepository extends JpaRepository<PartOrder, Long> {
    List<PartOrder> findByBuyerId(Long buyerId);
    List<PartOrder> findBySellerId(Long sellerId);
}