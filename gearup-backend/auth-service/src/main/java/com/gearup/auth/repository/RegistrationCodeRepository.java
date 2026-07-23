package com.gearup.auth.repository;

import com.gearup.auth.entity.RegistrationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, Long> {
    Optional<RegistrationCode> findTopByEmailAndCodeOrderByCreatedAtDesc(String email, String code);
}