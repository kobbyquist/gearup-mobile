package com.gearup.payment.repository;

import com.gearup.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPayerId(Long payerId);
    List<Payment> findByPayeeId(Long payeeId);
    Optional<Payment> findByJobId(Long jobId);
}