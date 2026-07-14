package com.gearup.auth.repository;

import com.gearup.auth.entity.AccountDeletionCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountDeletionCodeRepository extends JpaRepository<AccountDeletionCode, Long> {
    Optional<AccountDeletionCode> findTopByUserIdAndCodeOrderByCreatedAtDesc(Long userId, String code);
}