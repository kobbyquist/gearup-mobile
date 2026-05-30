package com.gearup.job.dto;

import com.gearup.job.entity.Job.JobType;
import jakarta.validation.constraints.*;
import lombok.*;

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
}