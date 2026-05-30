package com.gearup.review.service;

import com.gearup.review.dto.CreateReviewRequest;
import com.gearup.review.dto.ReviewDto;
import com.gearup.review.entity.Review;
import com.gearup.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewDto createReview(Long reviewerId, CreateReviewRequest request) {
        if (reviewRepository.existsByJobIdAndReviewerId(request.getJobId(), reviewerId)) {
            throw new RuntimeException("You have already reviewed this job");
        }

        Review review = Review.builder()
                .jobId(request.getJobId())
                .reviewerId(reviewerId)
                .revieweeId(request.getRevieweeId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return mapToDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getReviewsForUser(Long revieweeId) {
        return reviewRepository.findByRevieweeId(revieweeId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ReviewDto> getReviewsByUser(Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public Double getAverageRating(Long revieweeId) {
        Double avg = reviewRepository.getAverageRatingByRevieweeId(revieweeId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .jobId(review.getJobId())
                .reviewerId(review.getReviewerId())
                .revieweeId(review.getRevieweeId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}