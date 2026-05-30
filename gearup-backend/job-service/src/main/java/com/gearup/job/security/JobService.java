package com.gearup.job.service;

import com.gearup.job.dto.CreateJobRequest;
import com.gearup.job.dto.JobDto;
import com.gearup.job.entity.Job;
import com.gearup.job.entity.Job.JobStatus;
import com.gearup.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public JobDto createJob(Long ownerId, CreateJobRequest request) {
        Job job = Job.builder()
                .ownerId(ownerId)
                .vehicleId(request.getVehicleId())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .estimatedCost(request.getEstimatedCost())
                .build();

        return mapToDto(jobRepository.save(job));
    }

    public List<JobDto> getMyJobsAsOwner(Long ownerId) {
        return jobRepository.findByOwnerId(ownerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<JobDto> getMyJobsAsMechanic(Long mechanicId) {
        return jobRepository.findByMechanicId(mechanicId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<JobDto> getAvailableJobs() {
        return jobRepository.findByStatus(JobStatus.PENDING)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public JobDto getJobById(Long jobId) {
        return mapToDto(jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found")));
    }

    public JobDto acceptJob(Long jobId, Long mechanicId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != JobStatus.PENDING) {
            throw new RuntimeException("Job is not available");
        }

        job.setMechanicId(mechanicId);
        job.setStatus(JobStatus.ACCEPTED);
        job.setAcceptedAt(LocalDateTime.now());

        return mapToDto(jobRepository.save(job));
    }

    public JobDto startJob(Long jobId, Long mechanicId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getMechanicId().equals(mechanicId)) {
            throw new RuntimeException("Unauthorized");
        }

        job.setStatus(JobStatus.IN_PROGRESS);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto completeJob(Long jobId, Long mechanicId, Double finalCost) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getMechanicId().equals(mechanicId)) {
            throw new RuntimeException("Unauthorized");
        }

        job.setStatus(JobStatus.COMPLETED);
        job.setFinalCost(finalCost);
        job.setCompletedAt(LocalDateTime.now());

        return mapToDto(jobRepository.save(job));
    }

    public JobDto cancelJob(Long jobId, Long ownerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        job.setStatus(JobStatus.CANCELLED);
        return mapToDto(jobRepository.save(job));
    }

    private JobDto mapToDto(Job job) {
        return JobDto.builder()
                .id(job.getId())
                .ownerId(job.getOwnerId())
                .mechanicId(job.getMechanicId())
                .vehicleId(job.getVehicleId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .latitude(job.getLatitude())
                .longitude(job.getLongitude())
                .status(job.getStatus())
                .type(job.getType())
                .estimatedCost(job.getEstimatedCost())
                .finalCost(job.getFinalCost())
                .createdAt(job.getCreatedAt())
                .acceptedAt(job.getAcceptedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
}