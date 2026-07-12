package com.gearup.user.repository;

import com.gearup.user.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByOwnerId(Long ownerId);
    Optional<Favorite> findByOwnerIdAndMechanicId(Long ownerId, Long mechanicId);
    boolean existsByOwnerIdAndMechanicId(Long ownerId, Long mechanicId);
    void deleteByOwnerIdAndMechanicId(Long ownerId, Long mechanicId);
}