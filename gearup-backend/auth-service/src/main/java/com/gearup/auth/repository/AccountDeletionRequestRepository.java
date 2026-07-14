package com.gearup.auth.repository;

import com.gearup.auth.entity.AccountDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {
    Optional<AccountDeletionRequest> findTopByUserIdAndStatusOrderByRequestedAtDesc(Long userId, AccountDeletionRequest.Status status);
}