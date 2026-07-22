package com.gearup.payment.dto.paystack;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

// Wraps Paystack's GET /transaction/verify/:reference response.
// response.status here means "did the API call itself succeed" — NOT the transaction outcome.
// The real transaction outcome is data.status ("success" / "failed" / "abandoned").
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaystackVerifyResponse {

    private boolean status;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        private String status; // "success", "failed", "abandoned"
        private String reference;

        // Amount in the smallest currency unit (pesewas for GHS). Divide by 100 for display/comparison.
        private Long amount;

        private String currency;

        @JsonProperty("gateway_response")
        private String gatewayResponse;

        @JsonProperty("paid_at")
        private String paidAt;

        private String channel;
    }
}