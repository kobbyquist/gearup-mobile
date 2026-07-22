package com.gearup.payment.service;

import com.gearup.payment.dto.paystack.*;
import com.gearup.payment.exception.PaystackException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaystackService {

    private final RestTemplate restTemplate;

    @Value("${paystack.secret.key}")
    private String secretKey;

    private static final String BASE_URL = "https://api.paystack.co";

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Verifies a transaction reference with Paystack. Returns the verified amount in the
     * major unit (GHS, not pesewas) if — and only if — the transaction actually succeeded.
     * Throws PaystackException for any other outcome, so callers never need to re-check status.
     */
    public double verifyTransaction(String reference) {
        String url = BASE_URL + "/transaction/verify/" + reference;
        HttpEntity<Void> entity = new HttpEntity<>(authHeaders());

        ResponseEntity<PaystackVerifyResponse> response;
        try {
            response = restTemplate.exchange(url, HttpMethod.GET, entity, PaystackVerifyResponse.class);
        } catch (RestClientException ex) {
            log.error("Paystack verify call failed for reference {}: {}", reference, ex.getMessage());
            throw new PaystackException("Could not reach Paystack to verify transaction");
        }

        PaystackVerifyResponse body = response.getBody();
        if (body == null || body.getData() == null) {
            throw new PaystackException("Empty response from Paystack verify endpoint");
        }

        String txStatus = body.getData().getStatus();
        if (!"success".equals(txStatus)) {
            throw new PaystackException("Transaction not successful, status: " + txStatus);
        }

        Long amountInPesewas = body.getData().getAmount();
        if (amountInPesewas == null) {
            throw new PaystackException("Paystack response missing amount");
        }

        return amountInPesewas / 100.0;
    }

    /**
     * Confirms a bank account number resolves to a real, named account. Returns the
     * account name as held by the bank — the mechanic never gets to type this themselves.
     */
    public String resolveAccountName(String accountNumber, String bankCode) {
        String url = BASE_URL + "/bank/resolve?account_number=" + accountNumber + "&bank_code=" + bankCode;
        HttpEntity<Void> entity = new HttpEntity<>(authHeaders());

        ResponseEntity<PaystackResolveAccountResponse> response;
        try {
            response = restTemplate.exchange(url, HttpMethod.GET, entity, PaystackResolveAccountResponse.class);
        } catch (RestClientException ex) {
            log.error("Paystack resolve-account call failed: {}", ex.getMessage());
            throw new PaystackException("Could not verify account number with Paystack");
        }

        PaystackResolveAccountResponse body = response.getBody();
        if (body == null || !body.isStatus() || body.getData() == null) {
            throw new PaystackException("Account number could not be resolved");
        }

        return body.getData().getAccountName();
    }

    /**
     * Creates a reusable Paystack transfer recipient for a resolved bank account.
     * recipientType is "mobile_money" or "nuban" (Ghanaian bank accounts use "ghipss"
     * per Paystack's Ghana docs — passed in by the caller since it depends on the bank).
     */
    public String createTransferRecipient(String recipientType, String accountName,
                                           String accountNumber, String bankCode) {
        String url = BASE_URL + "/transferrecipient";

        Map<String, String> body = new HashMap<>();
        body.put("type", recipientType);
        body.put("name", accountName);
        body.put("account_number", accountNumber);
        body.put("bank_code", bankCode);
        body.put("currency", "GHS");

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, authHeaders());

        ResponseEntity<PaystackCreateRecipientResponse> response;
        try {
            response = restTemplate.postForEntity(url, entity, PaystackCreateRecipientResponse.class);
        } catch (RestClientException ex) {
            log.error("Paystack create-recipient call failed: {}", ex.getMessage());
            throw new PaystackException("Could not register bank account with Paystack");
        }

        PaystackCreateRecipientResponse responseBody = response.getBody();
        if (responseBody == null || !responseBody.isStatus() || responseBody.getData() == null) {
            throw new PaystackException("Paystack did not return a recipient code");
        }

        return responseBody.getData().getRecipientCode();
    }

    /**
     * Initiates a transfer (payout) to a previously-created recipient.
     * amount is in major unit (GHS) — converted to pesewas here so callers never
     * have to remember the subunit conversion themselves.
     * Returns the Paystack transfer reference for our own ledger record.
     */
    public String initiateTransfer(String recipientCode, double amount, String reasonNote) {
        String url = BASE_URL + "/transfer";

        Map<String, Object> body = new HashMap<>();
        body.put("source", "balance");
        body.put("amount", Math.round(amount * 100));
        body.put("recipient", recipientCode);
        body.put("reason", reasonNote);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, authHeaders());

        ResponseEntity<PaystackTransferResponse> response;
        try {
            response = restTemplate.postForEntity(url, entity, PaystackTransferResponse.class);
        } catch (RestClientException ex) {
            log.error("Paystack transfer call failed: {}", ex.getMessage());
            throw new PaystackException("Transfer could not be initiated with Paystack");
        }

        PaystackTransferResponse responseBody = response.getBody();
        if (responseBody == null || !responseBody.isStatus() || responseBody.getData() == null) {
            throw new PaystackException("Paystack did not confirm the transfer");
        }

        String transferStatus = responseBody.getData().getStatus();
        // "otp" means your Paystack dashboard has OTP-on-transfer enabled — the transfer
        // is created but needs a one-time-pin finalization step we haven't built yet.
        // Flagging loudly rather than silently treating it as success.
        if ("otp".equals(transferStatus)) {
            throw new PaystackException(
                "Transfer requires OTP finalization — disable OTP-on-transfer in your Paystack " +
                "dashboard settings for test mode, or let me know and I'll add the finalize step."
            );
        }
        if (!"success".equals(transferStatus) && !"pending".equals(transferStatus)) {
            throw new PaystackException("Transfer failed, status: " + transferStatus);
        }

        return responseBody.getData().getReference();
    }
}