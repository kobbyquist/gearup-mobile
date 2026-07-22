package com.gearup.payment.service;

import com.gearup.payment.dto.*;
import com.gearup.payment.entity.BankAccount;
import com.gearup.payment.entity.Wallet;
import com.gearup.payment.entity.WalletTransaction;
import com.gearup.payment.entity.WalletTransaction.TransactionStatus;
import com.gearup.payment.entity.WalletTransaction.TransactionType;
import com.gearup.payment.exception.PaystackException;
import com.gearup.payment.repository.BankAccountRepository;
import com.gearup.payment.repository.WalletRepository;
import com.gearup.payment.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PaystackService paystackService;
    private final WalletAuditService walletAuditService;

    @Value("${payment.simulate-withdrawals:false}")
    private boolean simulateWithdrawals;

    // ---------- Wallet lookup ----------

    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder().userId(userId).balance(0.0).build()
                ));
    }

    public WalletDto getWallet(Long userId) {
        return toWalletDto(getOrCreateWallet(userId));
    }

    // ---------- Deposit ----------

    /**
     * Verifies a Paystack deposit reference and credits the wallet — only if the reference
     * hasn't been used before, the transaction actually succeeded, and the amount matches
     * what the client claims. Any failure here throws before touching the wallet balance.
     */
    @Transactional
    public WalletDto verifyAndCreditDeposit(Long userId, DepositVerifyRequest request) {
        if (walletTransactionRepository.existsByPaystackReference(request.getReference())) {
            throw new RuntimeException("This deposit has already been processed");
        }

        double verifiedAmount = paystackService.verifyTransaction(request.getReference());

        if (Math.abs(verifiedAmount - request.getAmount()) > 0.01) {
            throw new RuntimeException(
                "Verified amount (GHS " + verifiedAmount + ") does not match claimed amount (GHS " + request.getAmount() + ")"
            );
        }

        Wallet wallet = getOrCreateWallet(userId);
        double newBalance = wallet.getBalance() + verifiedAmount;
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(TransactionType.DEPOSIT)
                .amount(verifiedAmount)
                .balanceAfter(newBalance)
                .paystackReference(request.getReference())
                .status(TransactionStatus.COMPLETED)
                .description("Wallet top-up via Paystack")
                .build();
        walletTransactionRepository.save(txn);

        return toWalletDto(wallet);
    }

    // ---------- Job payment (internal ledger transfer, no Paystack call) ----------

    /**
     * Moves money from payer's wallet to payee's wallet for a completed job.
     * Called from PaymentService.completePayment() inside the same transaction,
     * so if this throws (e.g. insufficient balance), the payment status update
     * rolls back too — never left in a half-completed state.
     */
    @Transactional
    public void transferForJobPayment(Long payerId, Long payeeId, Double amount, Long jobId, Long paymentId) {
        Wallet payerWallet = getOrCreateWallet(payerId);

        if (payerWallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance — please top up before paying for this job");
        }

        Wallet payeeWallet = getOrCreateWallet(payeeId);

        double payerNewBalance = payerWallet.getBalance() - amount;
        double payeeNewBalance = payeeWallet.getBalance() + amount;

        payerWallet.setBalance(payerNewBalance);
        payeeWallet.setBalance(payeeNewBalance);
        walletRepository.save(payerWallet);
        walletRepository.save(payeeWallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .walletId(payerWallet.getId())
                .type(TransactionType.JOB_PAYMENT_SENT)
                .amount(amount)
                .balanceAfter(payerNewBalance)
                .jobId(jobId)
                .paymentId(paymentId)
                .status(TransactionStatus.COMPLETED)
                .description("Payment sent for job #" + jobId)
                .build());

        walletTransactionRepository.save(WalletTransaction.builder()
                .walletId(payeeWallet.getId())
                .type(TransactionType.JOB_PAYMENT_RECEIVED)
                .amount(amount)
                .balanceAfter(payeeNewBalance)
                .jobId(jobId)
                .paymentId(paymentId)
                .status(TransactionStatus.COMPLETED)
                .description("Payment received for job #" + jobId)
                .build());
    }

    // ---------- Transaction history ----------

    public List<WalletTransactionDto> getTransactions(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream().map(this::toTransactionDto).collect(Collectors.toList());
    }

    // ---------- Bank account (mechanic payout details) ----------

    @Transactional
    public BankAccountDto saveBankAccount(Long userId, SaveBankAccountRequest request) {
        String resolvedName = paystackService.resolveAccountName(request.getAccountNumber(), request.getBankCode());

        String recipientType = request.getAccountType() == BankAccount.AccountType.MOBILE_MONEY
                ? "mobile_money" : "ghipss";
        String recipientCode = paystackService.createTransferRecipient(
                recipientType, resolvedName, request.getAccountNumber(), request.getBankCode()
        );

        BankAccount account = bankAccountRepository.findByUserId(userId).orElseGet(BankAccount::new);
        account.setUserId(userId);
        account.setAccountType(request.getAccountType());
        account.setBankCode(request.getBankCode());
        account.setBankName(request.getBankName());
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountName(resolvedName);
        account.setPaystackRecipientCode(recipientCode);

        bankAccountRepository.save(account);
        return toBankAccountDto(account);
    }

    public BankAccountDto getBankAccount(Long userId) {
        return bankAccountRepository.findByUserId(userId)
                .map(this::toBankAccountDto)
                .orElse(null);
    }

    // ---------- Withdrawal ----------

    /**
     * Deducts from wallet first (so balance can never be double-spent while the transfer
     * is in flight), then calls Paystack. If the transfer call fails, the deduction is
     * reversed and the ledger row is marked FAILED — the user never silently loses balance.
     */
    /**
     * Calls Paystack BEFORE touching the wallet balance — the deduction and the COMPLETED
     * ledger row only get written (and committed together) if the transfer actually succeeds.
     * On failure, nothing here has been persisted yet, so there's nothing to "undo": the whole
     * method simply rolls back. A separate FAILED audit row is still recorded via
     * recordFailedWithdrawal(), which commits independently in its own transaction so it
     * survives this method's rollback.
     */
    @Transactional
    public WalletTransactionDto withdraw(Long userId, WithdrawRequest request) {
        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getBalance() < request.getAmount()) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        BankAccount bankAccount = bankAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No bank account on file — please add one first"));

        double originalBalance = wallet.getBalance();
        double balanceAfterDeduction = originalBalance - request.getAmount();

        String transferReference;
        boolean simulated = false;
        try {
            transferReference = paystackService.initiateTransfer(
                    bankAccount.getPaystackRecipientCode(), request.getAmount(), "GearUp wallet withdrawal"
            );
        } catch (PaystackException ex) {
            if (!simulateWithdrawals) {
                walletAuditService.recordFailedWithdrawal(wallet.getId(), request.getAmount(), originalBalance, bankAccount.getBankName(), ex.getMessage());
                throw ex;
            }
            // Real Paystack call was made and genuinely rejected (logged above by PaystackService) —
            // this branch only simulates the outcome because Paystack requires a Registered Business
            // account for real transfers, which is out of scope for this project. Loudly logged and
            // clearly labeled in the ledger so it's never mistaken for a real payout.
            log.warn("SIMULATED withdrawal: real Paystack transfer was rejected ({}), simulating success for demo purposes.", ex.getMessage());
            transferReference = "SIMULATED_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
            simulated = true;
        }

        wallet.setBalance(balanceAfterDeduction);
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(TransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceAfter(balanceAfterDeduction)
                .paystackReference(transferReference)
                .status(TransactionStatus.COMPLETED)
                .description(simulated
                        ? "Withdrawal to " + bankAccount.getBankName() + " (SIMULATED — real transfer blocked by Paystack business verification)"
                        : "Withdrawal to " + bankAccount.getBankName())
                .build();
        walletTransactionRepository.save(txn);

        return toTransactionDto(txn);
    }


    // ---------- Mapping helpers ----------

    private WalletDto toWalletDto(Wallet wallet) {
        return WalletDto.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .build();
    }

    private WalletTransactionDto toTransactionDto(WalletTransaction txn) {
        return WalletTransactionDto.builder()
                .id(txn.getId())
                .walletId(txn.getWalletId())
                .type(txn.getType())
                .amount(txn.getAmount())
                .balanceAfter(txn.getBalanceAfter())
                .paystackReference(txn.getPaystackReference())
                .jobId(txn.getJobId())
                .paymentId(txn.getPaymentId())
                .status(txn.getStatus())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }

    private BankAccountDto toBankAccountDto(BankAccount account) {
        return BankAccountDto.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .accountType(account.getAccountType())
                .bankCode(account.getBankCode())
                .bankName(account.getBankName())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .createdAt(account.getCreatedAt())
                .build();
    }
}