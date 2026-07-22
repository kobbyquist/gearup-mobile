package com.gearup.payment.repository;

import com.gearup.payment.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
    Optional<WalletTransaction> findByPaystackReference(String paystackReference);
    boolean existsByPaystackReference(String paystackReference);
}