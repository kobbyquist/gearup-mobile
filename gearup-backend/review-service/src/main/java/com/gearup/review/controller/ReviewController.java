package com.gearup.review.controller;

import com.gearup.review.dto.CreateReviewRequest;
import com.gearup.review.dto.ReviewDto;
import com.gearup.review.security.JwtService;
import com.gearup.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateReviewRequest request) {
        Long reviewerId = extractUserId(authHeader);
        return ResponseEntity.ok(reviewService.createReview(reviewerId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDto>> getReviewsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewDto>> getMyReviews(
            @RequestHeader("Authorization") String authHeader) {
        Long reviewerId = extractUserId(authHeader);
        return ResponseEntity.ok(reviewService.getReviewsByUser(reviewerId));
    }

    @GetMapping("/rating/{userId}")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable Long userId) {
        Double avg = reviewService.getAverageRating(userId);
        return ResponseEntity.ok(Map.of("averageRating", avg));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}