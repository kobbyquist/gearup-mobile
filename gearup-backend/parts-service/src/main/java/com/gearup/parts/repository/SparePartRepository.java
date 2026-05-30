package com.gearup.parts.repository;

import com.gearup.parts.entity.SparePart;
import com.gearup.parts.entity.SparePart.PartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    List<SparePart> findBySellerId(Long sellerId);
    List<SparePart> findByStatus(PartStatus status);
    List<SparePart> findByNameContainingIgnoreCaseAndStatus(String name, PartStatus status);
    List<SparePart> findByCarMakeIgnoreCaseAndStatus(String carMake, PartStatus status);
}