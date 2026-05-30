package com.gearup.payment.service;

import com.gearup.payment.dto.CreatePaymentRequest;
import com.gearup.payment.dto.PaymentDto;
import com.gearup.payment.entity.Payment;
import com.gearup.payment.entity.Payment.PaymentStatus;
import com.gearup.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentDto createPayment(Long payerId, CreatePaymentRequest request) {
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

    public PaymentDto completePayment(Long paymentId, Long payerId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getPayerId().equals(payerId)) {
            throw new RuntimeException("Unauthorized");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        return mapToDto(paymentRepository.save(payment));
    }

    public PaymentDto getPaymentByJob(Long jobId) {
        Payment payment = paymentRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
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