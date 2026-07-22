package com.gearup.payment.exception;

// Thrown whenever a Paystack call fails or returns an outcome we can't proceed with
// (transaction not successful, amount mismatch, account not resolvable, transfer failed).
public class PaystackException extends RuntimeException {
    public PaystackException(String message) {
        super(message);
    }
}