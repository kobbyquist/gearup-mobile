package com.gearup.user.controller;

import com.gearup.user.dto.UserProfileDto;
import com.gearup.user.security.JwtService;
import com.gearup.user.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getFavorites(
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(favoriteService.getFavoriteMechanics(ownerId));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(favoriteService.getFavoriteMechanicIds(ownerId));
    }

    @PostMapping("/{mechanicId}")
    public ResponseEntity<Map<String, Boolean>> addFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long mechanicId) {
        Long ownerId = extractUserId(authHeader);
        favoriteService.addFavorite(ownerId, mechanicId);
        return ResponseEntity.ok(Map.of("favorited", true));
    }

    @DeleteMapping("/{mechanicId}")
    public ResponseEntity<Map<String, Boolean>> removeFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long mechanicId) {
        Long ownerId = extractUserId(authHeader);
        favoriteService.removeFavorite(ownerId, mechanicId);
        return ResponseEntity.ok(Map.of("favorited", false));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}