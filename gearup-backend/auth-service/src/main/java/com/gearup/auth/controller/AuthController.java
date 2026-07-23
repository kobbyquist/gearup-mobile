package com.gearup.auth.controller;

import com.gearup.auth.dto.*;
import com.gearup.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/send-code")
    public ResponseEntity<Map<String, String>> sendRegistrationCode(@Valid @RequestBody SendRegistrationCodeRequest request) {
        authService.sendRegistrationCode(request);
        return ResponseEntity.ok(Map.of("message", "Verification code sent to your email."));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<AuthResponse> verifyRegistration(@Valid @RequestBody VerifyRegistrationRequest request) {
        return ResponseEntity.ok(authService.verifyRegistrationAndCreateAccount(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "A reset code has been sent to your email."));
    }
@PostMapping("/verify-reset-code")
    public ResponseEntity<Map<String, String>> verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        authService.verifyResetCode(request);
        return ResponseEntity.ok(Map.of("message", "Code verified."));
    }
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful. Please log in with your new password."));
    }
}