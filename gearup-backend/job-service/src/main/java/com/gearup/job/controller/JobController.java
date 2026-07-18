package com.gearup.job.controller;

import com.gearup.job.dto.CreateJobRequest;
import com.gearup.job.dto.JobDto;
import com.gearup.job.dto.ProposeBidRequest;
import com.gearup.job.dto.ProposeChangesRequest;
import com.gearup.job.security.JwtService;
import com.gearup.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.gearup.job.dto.ProposeBidRequest;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<JobDto> createJob(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateJobRequest request) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.createJob(ownerId, request));
    }

    @GetMapping("/my/owner")
    public ResponseEntity<List<JobDto>> getMyJobsAsOwner(
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.getMyJobsAsOwner(ownerId));
    }

    @GetMapping("/my/mechanic")
    public ResponseEntity<List<JobDto>> getMyJobsAsMechanic(
            @RequestHeader("Authorization") String authHeader) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.getMyJobsAsMechanic(mechanicId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<JobDto>> getAvailableJobs(
            @RequestHeader("Authorization") String authHeader) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.getAvailableJobs(mechanicId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<JobDto> acceptJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.acceptJob(id, mechanicId));
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<JobDto> declineJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.declineJob(id, mechanicId));
    }

    @PutMapping("/{id}/propose-changes")
    public ResponseEntity<JobDto> proposeChanges(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ProposeChangesRequest request) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.proposeChanges(id, mechanicId, request));
    }

    @PutMapping("/{id}/counter-offer/accept")
    public ResponseEntity<JobDto> acceptCounterOffer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.acceptCounterOffer(id, ownerId));
    }

    @PutMapping("/{id}/counter-offer/reject")
    public ResponseEntity<JobDto> rejectCounterOffer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.rejectCounterOffer(id, ownerId));
    }

    @PutMapping("/{id}/cost")
    public ResponseEntity<JobDto> updateFinalCost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.updateFinalCost(id, mechanicId, body.get("finalCost")));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<JobDto> startJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.startJob(id, mechanicId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<JobDto> completeJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        Long mechanicId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.completeJob(id, mechanicId, body.get("finalCost")));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<JobDto> cancelJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long ownerId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.cancelJob(id, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long ownerId = extractUserId(authHeader);
        jobService.deleteJob(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/bid")
    public ResponseEntity<JobDto> proposeBid(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ProposeBidRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.proposeBid(id, userId, request));
    }

    @PutMapping("/{id}/bid/accept")
    public ResponseEntity<JobDto> acceptBid(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.acceptBid(id, userId));
    }

    @PutMapping("/{id}/bid/decline")
    public ResponseEntity<JobDto> declineBid(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(jobService.declineBid(id, userId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}