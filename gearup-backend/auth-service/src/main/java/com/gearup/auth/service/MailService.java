package com.gearup.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String name, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your GearUp password reset code");
        message.setText(
                "Hi " + name + ",\n\n" +
                "We received a request to reset your GearUp password. Enter this code in the app to continue:\n\n" +
                code + "\n\n" +
                "This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.\n\n" +
                "— The GearUp Team"
        );
        mailSender.send(message);
    }
}