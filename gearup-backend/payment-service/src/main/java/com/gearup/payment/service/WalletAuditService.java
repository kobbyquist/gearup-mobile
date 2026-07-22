package com.gearup.payment.service;

import com.gearup.payment.entity.WalletTransaction;
import com.gearup.payment.entity.WalletTransaction.TransactionStatus;
import com.gearup.payment.entity.WalletTransaction.TransactionType;
import com.gearup.payment.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletAuditService {

    private final WalletTransactionRepository walletTransactionRepository;

    /**
     * Deliberately lives in its own bean, separate from WalletService. REQUIRES_NEW only
     * takes effect when a method call passes through Spring's @Transactional proxy — calling
     * it as a same-class ("self-invocation") method bypasses the proxy entirely, silently
     * inheriting the caller's transaction instead of opening a new one. That was the actual
     * bug: the insert ran, but as part of the outer transaction, so it rolled back with it.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedWithdrawal(Long walletId, double amount, double balanceAtAttempt, String bankName, String failureReason) {
        WalletTransaction txn = WalletTransaction.builder()
                .walletId(walletId)
                .type(TransactionType.WITHDRAWAL)
                .amount(amount)
                .balanceAfter(balanceAtAttempt)
                .status(TransactionStatus.FAILED)
                .description("Withdrawal to " + bankName + " failed: " + failureReason)
                .build();
        walletTransactionRepository.save(txn);
    }
}