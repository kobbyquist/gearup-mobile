package com.gearup.job.service;

import com.gearup.job.dto.CreateJobRequest;
import com.gearup.job.dto.JobDto;
import com.gearup.job.dto.ProposeBidRequest;
import com.gearup.job.dto.ProposeChangesRequest;
import com.gearup.job.entity.Job;
import com.gearup.job.entity.Job.JobStatus;
import com.gearup.job.entity.Job.RequestType;
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
                .scheduledDate(request.getScheduledDate())
                .requestType(request.getRequestType() != null ? request.getRequestType() : RequestType.GENERAL)
                .preferredMechanicId(request.getPreferredMechanicId())
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

    public List<JobDto> getAvailableJobs(Long mechanicId) {
        return jobRepository.findByStatus(JobStatus.PENDING)
                .stream()
                .filter(job -> job.getRequestType() != RequestType.DIRECT
                        || (job.getPreferredMechanicId() != null && job.getPreferredMechanicId().equals(mechanicId)))
                .map(this::mapToDto).collect(Collectors.toList());
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
        if (job.getRequestType() == RequestType.DIRECT
                && job.getPreferredMechanicId() != null
                && !job.getPreferredMechanicId().equals(mechanicId)) {
            throw new RuntimeException("This job was requested for a specific mechanic");
        }
        job.setMechanicId(mechanicId);
        job.setStatus(JobStatus.ACCEPTED);
        job.setAcceptedAt(LocalDateTime.now());
        job.setProposedCost(null);
        job.setProposedScheduledDate(null);
        job.setProposedNote(null);
        job.setProposedByMechanicId(null);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto declineJob(Long jobId, Long mechanicId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != JobStatus.PENDING) {
            throw new RuntimeException("Job is not available");
        }
        if (job.getRequestType() != RequestType.DIRECT
                || job.getPreferredMechanicId() == null
                || !job.getPreferredMechanicId().equals(mechanicId)) {
            throw new RuntimeException("Only the requested mechanic can decline this job");
        }
        job.setStatus(JobStatus.CANCELLED);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto proposeChanges(Long jobId, Long mechanicId, ProposeChangesRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != JobStatus.PENDING) {
            throw new RuntimeException("Can only propose changes on a pending job");
        }
        if (job.getRequestType() != RequestType.DIRECT
                || job.getPreferredMechanicId() == null
                || !job.getPreferredMechanicId().equals(mechanicId)) {
            throw new RuntimeException("Only the requested mechanic can propose changes to this job");
        }
        job.setProposedCost(request.getProposedCost());
        job.setProposedScheduledDate(request.getProposedScheduledDate());
        job.setProposedNote(request.getProposedNote());
        job.setProposedByMechanicId(mechanicId);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto acceptCounterOffer(Long jobId, Long ownerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.getProposedByMechanicId() == null) {
            throw new RuntimeException("No pending counter-offer on this job");
        }
        if (job.getProposedCost() != null) {
            job.setEstimatedCost(job.getProposedCost());
        }
        if (job.getProposedScheduledDate() != null) {
            job.setScheduledDate(job.getProposedScheduledDate());
        }
        job.setMechanicId(job.getProposedByMechanicId());
        job.setStatus(JobStatus.ACCEPTED);
        job.setAcceptedAt(LocalDateTime.now());
        job.setProposedCost(null);
        job.setProposedScheduledDate(null);
        job.setProposedNote(null);
        job.setProposedByMechanicId(null);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto rejectCounterOffer(Long jobId, Long ownerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }
        job.setProposedCost(null);
        job.setProposedScheduledDate(null);
        job.setProposedNote(null);
        job.setProposedByMechanicId(null);
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

    public JobDto updateFinalCost(Long jobId, Long mechanicId, Double newCost) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getMechanicId().equals(mechanicId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new RuntimeException("Can only edit cost on completed jobs");
        }
        job.setFinalCost(newCost);
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

    public void deleteJob(Long jobId, Long ownerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.getStatus() != JobStatus.CANCELLED && job.getStatus() != JobStatus.COMPLETED) {
            throw new RuntimeException("Only cancelled or completed jobs can be deleted");
        }
        jobRepository.delete(job);
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
                .scheduledDate(job.getScheduledDate())
                .status(job.getStatus())
                .type(job.getType())
                .requestType(job.getRequestType())
                .preferredMechanicId(job.getPreferredMechanicId())
                .estimatedCost(job.getEstimatedCost())
                .finalCost(job.getFinalCost())
                .createdAt(job.getCreatedAt())
                .acceptedAt(job.getAcceptedAt())
                .completedAt(job.getCompletedAt())
                .proposedCost(job.getProposedCost())
                .proposedScheduledDate(job.getProposedScheduledDate())
                .proposedNote(job.getProposedNote())
                .proposedByMechanicId(job.getProposedByMechanicId())
                .biddingCost(job.getBiddingCost())
                .biddingNote(job.getBiddingNote())
                .biddingByUserId(job.getBiddingByUserId())
                .build();
    }

    public JobDto proposeBid(Long jobId, Long userId, ProposeBidRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new RuntimeException("Can only negotiate price on a completed job");
        }
        boolean isParty = userId.equals(job.getOwnerId()) || userId.equals(job.getMechanicId());
        if (!isParty) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.getBiddingByUserId() != null && job.getBiddingByUserId().equals(userId)) {
            throw new RuntimeException("Waiting for the other party to respond to your current offer");
        }
        job.setBiddingCost(request.getBiddingCost());
        job.setBiddingNote(request.getBiddingNote());
        job.setBiddingByUserId(userId);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto acceptBid(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        boolean isParty = userId.equals(job.getOwnerId()) || userId.equals(job.getMechanicId());
        if (!isParty) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.getBiddingByUserId() == null) {
            throw new RuntimeException("No pending price offer on this job");
        }
        if (job.getBiddingByUserId().equals(userId)) {
            throw new RuntimeException("You cannot accept your own offer");
        }
        job.setFinalCost(job.getBiddingCost());
        job.setBiddingCost(null);
        job.setBiddingNote(null);
        job.setBiddingByUserId(null);
        return mapToDto(jobRepository.save(job));
    }

    public JobDto declineBid(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        boolean isParty = userId.equals(job.getOwnerId()) || userId.equals(job.getMechanicId());
        if (!isParty) {
            throw new RuntimeException("Unauthorized");
        }
        job.setBiddingCost(null);
        job.setBiddingNote(null);
        job.setBiddingByUserId(null);
        return mapToDto(jobRepository.save(job));
    }
}