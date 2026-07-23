package com.gearup.auth.service;
import com.gearup.auth.dto.*;
import com.gearup.auth.entity.PasswordResetToken;
import com.gearup.auth.entity.RegistrationCode;
import com.gearup.auth.entity.User;
import com.gearup.auth.repository.PasswordResetTokenRepository;
import com.gearup.auth.repository.RegistrationCodeRepository;
import com.gearup.auth.repository.UserRepository;
import com.gearup.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RegistrationCodeRepository registrationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final Set<String> ALLOWED_EMAIL_DOMAINS = Set.of(
            "gmail.com", "outlook.com", "hotmail.com", "yahoo.com",
            "icloud.com", "live.com", "aol.com", "protonmail.com"
    );

    private void validateEmailDomain(String email) {
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        if (!ALLOWED_EMAIL_DOMAINS.contains(domain)) {
            throw new RuntimeException("Please use an email from a standard provider (e.g. Gmail, Outlook, Yahoo)");
        }
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .role(saved.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        validateEmailDomain(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email. Please sign up first."));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    public void sendRegistrationCode(SendRegistrationCodeRequest request) {
        validateEmailDomain(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        RegistrationCode regCode = RegistrationCode.builder()
                .email(request.getEmail())
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        registrationCodeRepository.save(regCode);
        mailService.sendRegistrationCodeEmail(request.getEmail(), request.getName(), code);
    }

    public AuthResponse verifyRegistrationAndCreateAccount(VerifyRegistrationRequest request) {
        RegistrationCode regCode = registrationCodeRepository
                .findTopByEmailAndCodeOrderByCreatedAtDesc(request.getEmail(), request.getCode())
                .orElseThrow(() -> new RuntimeException("Invalid email or code"));

        if (regCode.isUsed()) {
            throw new RuntimeException("This code has already been used. Please request a new one");
        }
        if (regCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This code has expired. Please request a new one");
        }

        // Defensive re-check: something could have registered this email/phone
        // in the gap between sending the code and verifying it.
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();
        User saved = userRepository.save(user);

        regCode.setUsed(true);
        registrationCodeRepository.save(regCode);

        String token = jwtService.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .role(saved.getRole())
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(code)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(resetToken);
        mailService.sendPasswordResetEmail(user.getEmail(), user.getName(), code);
    }
public void verifyResetCode(VerifyResetCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or code"));

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByUserIdAndTokenOrderByCreatedAtDesc(user.getId(), request.getCode())
                .orElseThrow(() -> new RuntimeException("Invalid email or code"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This code has already been used. Please request a new one");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This code has expired. Please request a new one");
        }
        // Intentionally does NOT mark the code as used — that only happens once the
        // password is actually changed in resetPassword(), which re-validates the
        // code anyway. This lets the user come back to this exact code if they
        // navigate away before finishing the "set new password" step.
    }
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or code"));

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByUserIdAndTokenOrderByCreatedAtDesc(user.getId(), request.getCode())
                .orElseThrow(() -> new RuntimeException("Invalid email or code"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This code has already been used. Please request a new one");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This code has expired. Please request a new one");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}