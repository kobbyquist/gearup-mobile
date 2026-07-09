package com.gearup.user.service;

import com.gearup.user.dto.UpdateProfileRequest;
import com.gearup.user.dto.UserProfileDto;
import com.gearup.user.entity.User;
import com.gearup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public List<UserProfileDto> getAllMechanics() {
    return userRepository.findAll()
            .stream()
            .filter(u -> u.getRole() == User.Role.MECHANIC)
            .map(this::mapToDto)
            .collect(Collectors.toList());
}

    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getLatitude() != null) user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) user.setLongitude(request.getLongitude());
        if (request.getAcceptingBookings() != null) user.setAcceptingBookings(request.getAcceptingBookings());
        if (request.getAvailabilityStart() != null) user.setAvailabilityStart(request.getAvailabilityStart());
        if (request.getAvailabilityEnd() != null) user.setAvailabilityEnd(request.getAvailabilityEnd());

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    public UserProfileDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
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
            .acceptingBookings(Boolean.TRUE.equals(user.getAcceptingBookings()))
            .availabilityStart(user.getAvailabilityStart())
            .availabilityEnd(user.getAvailabilityEnd())
            .createdAt(user.getCreatedAt())
            .build();
}
}