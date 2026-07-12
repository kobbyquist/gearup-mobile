package com.gearup.job.dto;

import com.gearup.job.entity.Job.JobType;
import com.gearup.job.entity.Job.RequestType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Vehicle is required")
    private Long vehicleId;

    @NotNull(message = "Job type is required")
    private JobType type;

    private String location;
    private Double latitude;
    private Double longitude;
    private Double estimatedCost;
    private LocalDateTime scheduledDate;
    private RequestType requestType;
    private Long preferredMechanicId;
}