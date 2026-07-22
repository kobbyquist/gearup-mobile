package com.gearup.payment.dto.paystack;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

// Wraps POST /transferrecipient — creates a reusable "recipient" so future withdrawals
// for this mechanic don't need to re-supply bank details every time.
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaystackCreateRecipientResponse {

    private boolean status;
    private String message;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        @JsonProperty("recipient_code")
        private String recipientCode;
    }
}