package com.gearup.payment.service;

import com.gearup.payment.dto.CreatePaymentRequest;
import com.gearup.payment.dto.PaymentDto;
import com.gearup.payment.entity.Payment;
import com.gearup.payment.entity.Payment.PaymentStatus;
import com.gearup.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;

    public PaymentDto createPayment(Long payerId, CreatePaymentRequest request) {
        // Guard against duplicate payments for the same job — without this, tapping
        // "Pay" more than once (e.g. because the UI looked stale) silently creates
        // a brand new charge every time, with no error ever surfacing.
        paymentRepository.findByJobId(request.getJobId()).ifPresent(existing -> {
            if (existing.getStatus() == Payment.PaymentStatus.COMPLETED) {
                throw new RuntimeException("This job has already been paid for");
            }
        });

        Payment payment = Payment.builder()
                .jobId(request.getJobId())
                .payerId(payerId)
                .payeeId(request.getPayeeId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .notes(request.getNotes())
                .reference(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        return mapToDto(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDto completePayment(Long paymentId, Long payerId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getPayerId().equals(payerId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed");
        }

        // Moves real wallet balance from payer to payee. Throws (e.g. insufficient
        // balance) before the status below is ever touched, so nothing is left half-done.
        walletService.transferForJobPayment(
                payment.getPayerId(), payment.getPayeeId(), payment.getAmount(),
                payment.getJobId(), payment.getId()
        );

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        return mapToDto(paymentRepository.save(payment));
    }

    public PaymentDto getPaymentByJob(Long jobId) {
        // Prefer a COMPLETED payment if one exists — the definitive answer to "is
        // this job paid?" — otherwise fall back to whatever's there (e.g. PENDING).
        List<Payment> payments = paymentRepository.findAllByJobId(jobId);
        if (payments.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        Payment payment = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .findFirst()
                .orElse(payments.get(0));
        return mapToDto(payment);
    }

    public List<PaymentDto> getMyPaymentsAsPayer(Long payerId) {
        return paymentRepository.findByPayerId(payerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getMyPaymentsAsPayee(Long payeeId) {
        return paymentRepository.findByPayeeId(payeeId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private PaymentDto mapToDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .jobId(payment.getJobId())
                .payerId(payment.getPayerId())
                .payeeId(payment.getPayeeId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .reference(payment.getReference())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}