package com.gearup.job.dto;

import com.gearup.job.entity.Job.JobStatus;
import com.gearup.job.entity.Job.JobType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDto {
    private Long id;
    private Long ownerId;
    private Long mechanicId;
    private Long vehicleId;
    private String title;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;
    private JobStatus status;
    private JobType type;
    private Double estimatedCost;
    private Double finalCost;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
}