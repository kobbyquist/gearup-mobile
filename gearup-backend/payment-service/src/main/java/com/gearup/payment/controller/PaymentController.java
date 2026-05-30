package com.gearup.payment.controller;

import com.gearup.payment.dto.CreatePaymentRequest;
import com.gearup.payment.dto.PaymentDto;
import com.gearup.payment.security.JwtService;
import com.gearup.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreatePaymentRequest request) {
        Long payerId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.createPayment(payerId, request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<PaymentDto> completePayment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long payerId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.completePayment(id, payerId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<PaymentDto> getPaymentByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(paymentService.getPaymentByJob(jobId));
    }

    @GetMapping("/my/payer")
    public ResponseEntity<List<PaymentDto>> getMyPaymentsAsPayer(
            @RequestHeader("Authorization") String authHeader) {
        Long payerId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.getMyPaymentsAsPayer(payerId));
    }

    @GetMapping("/my/payee")
    public ResponseEntity<List<PaymentDto>> getMyPaymentsAsPayee(
            @RequestHeader("Authorization") String authHeader) {
        Long payeeId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.getMyPaymentsAsPayee(payeeId));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}