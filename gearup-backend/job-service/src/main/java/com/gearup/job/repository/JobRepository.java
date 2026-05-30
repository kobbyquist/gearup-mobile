package com.gearup.job.repository;

import com.gearup.job.entity.Job;
import com.gearup.job.entity.Job.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByOwnerId(Long ownerId);
    List<Job> findByMechanicId(Long mechanicId);
    List<Job> findByStatus(JobStatus status);
    List<Job> findByOwnerIdAndStatus(Long ownerId, JobStatus status);
    List<Job> findByMechanicIdAndStatus(Long mechanicId, JobStatus status);
}