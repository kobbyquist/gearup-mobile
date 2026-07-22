package com.gearup.payment.dto.paystack;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

// Wraps POST /transfer — initiates the actual payout.
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaystackTransferResponse {

    private boolean status;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        // "success", "otp", "pending", "failed" — see note below about "otp"
        private String status;

        private String reference;

        @JsonProperty("transfer_code")
        private String transferCode;
    }
}