package com.gearup.auth.service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String name, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("GearUp <" + fromEmail + ">");
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
public void sendAccountDeletionCodeEmail(String toEmail, String name, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("GearUp <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject("Confirm your GearUp account deletion request");
        message.setText(
                "Hi " + name + ",\n\n" +
                "We received a request to delete your GearUp account. Enter this code in the app to confirm:\n\n" +
                code + "\n\n" +
                "This code expires in 15 minutes. Submitting this request does not delete your account immediately — " +
                "it will be reviewed before any action is taken. If you didn't request this, you can safely ignore this email.\n\n" +
                "— The GearUp Team"
        );
        mailSender.send(message);
    }
    public void sendRegistrationCodeEmail(String toEmail, String name, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("GearUp <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject("Verify your GearUp email");
        message.setText(
                "Hi " + name + ",\n\n" +
                "Welcome to GearUp! Enter this code in the app to verify your email and finish creating your account:\n\n" +
                code + "\n\n" +
                "This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.\n\n" +
                "— The GearUp Team"
        );
        mailSender.send(message);
    }
}