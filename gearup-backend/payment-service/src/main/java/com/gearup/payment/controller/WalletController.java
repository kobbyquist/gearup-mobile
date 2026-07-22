package com.gearup.payment.controller;

import com.gearup.payment.dto.*;
import com.gearup.payment.security.JwtService;
import com.gearup.payment.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<WalletDto> getMyWallet(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.getWallet(userId));
    }

    @PostMapping("/deposit/verify")
    public ResponseEntity<WalletDto> verifyDeposit(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody DepositVerifyRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.verifyAndCreditDeposit(userId, request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionDto>> getMyTransactions(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.getTransactions(userId));
    }

    @PostMapping("/bank-account")
    public ResponseEntity<BankAccountDto> saveBankAccount(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SaveBankAccountRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.saveBankAccount(userId, request));
    }

    @GetMapping("/bank-account")
    public ResponseEntity<BankAccountDto> getBankAccount(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.getBankAccount(userId));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletTransactionDto> withdraw(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody WithdrawRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(walletService.withdraw(userId, request));
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}