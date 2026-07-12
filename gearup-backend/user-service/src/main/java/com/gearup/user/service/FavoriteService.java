package com.gearup.user.service;

import com.gearup.user.dto.UserProfileDto;
import com.gearup.user.entity.Favorite;
import com.gearup.user.entity.User;
import com.gearup.user.repository.FavoriteRepository;
import com.gearup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addFavorite(Long ownerId, Long mechanicId) {
        if (favoriteRepository.existsByOwnerIdAndMechanicId(ownerId, mechanicId)) {
            return; // already favorited, no-op
        }
        User mechanic = userRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));
        if (mechanic.getRole() != User.Role.MECHANIC) {
            throw new RuntimeException("Can only favorite mechanics");
        }
        Favorite favorite = Favorite.builder()
                .ownerId(ownerId)
                .mechanicId(mechanicId)
                .build();
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long ownerId, Long mechanicId) {
        favoriteRepository.deleteByOwnerIdAndMechanicId(ownerId, mechanicId);
    }

    public List<Long> getFavoriteMechanicIds(Long ownerId) {
        return favoriteRepository.findByOwnerId(ownerId)
                .stream()
                .map(Favorite::getMechanicId)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getFavoriteMechanics(Long ownerId) {
        List<Long> mechanicIds = getFavoriteMechanicIds(ownerId);
        return userRepository.findAllById(mechanicIds)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .location(user.getLocation())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .role(user.getRole())
                .build();
    }
}