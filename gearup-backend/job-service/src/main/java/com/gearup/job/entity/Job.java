package com.gearup.job.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    private Long mechanicId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    private String location;
    private Double latitude;
    private Double longitude;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type")
    @Builder.Default
    private RequestType requestType = RequestType.GENERAL;

    @Column(name = "preferred_mechanic_id")
    private Long preferredMechanicId;

    private Double estimatedCost;
    private Double finalCost;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "proposed_cost")
    private Double proposedCost;

    @Column(name = "proposed_scheduled_date")
    private LocalDateTime proposedScheduledDate;

    @Column(name = "proposed_note", length = 500)
    private String proposedNote;

    @Column(name = "proposed_by_mechanic_id")
    private Long proposedByMechanicId;

    @Column(name = "bidding_cost")
    private Double biddingCost;

    @Column(name = "bidding_note", length = 500)
    private String biddingNote;

    @Column(name = "bidding_by_user_id")
    private Long biddingByUserId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum JobStatus {
        PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum JobType {
        TOWING, BATTERY, TIRE_CHANGE, FUEL, ENGINE, GENERAL
    }

    public enum RequestType {
        GENERAL, DIRECT
    }
}