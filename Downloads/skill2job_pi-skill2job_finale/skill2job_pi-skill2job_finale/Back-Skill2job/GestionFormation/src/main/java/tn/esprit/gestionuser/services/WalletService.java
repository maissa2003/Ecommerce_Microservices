package tn.esprit.gestionuser.services;

import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.entities.SpinHistory;
import tn.esprit.gestionuser.repositories.WalletRepository;
import tn.esprit.gestionuser.repositories.WalletTransactionRepository;
import tn.esprit.gestionuser.repositories.SpinHistoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserClient userClient;
    private final SpinHistoryRepository spinHistoryRepository;

    @Transactional
    public Wallet createWallet(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (walletRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Wallet already exists");
        }

        Wallet wallet = new Wallet();
        wallet.setUserId(user.getId());
        wallet.setBalance(50.0);
        wallet.setCurrency("USD");

        Wallet savedWallet = walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWalletId(savedWallet.getId());
        transaction.setUserId(user.getId());
        transaction.setType(TransactionType.WELCOME_BONUS);
        transaction.setAmount(50.0);
        transaction.setDescription("Welcome bonus - 50 free credits");
        transactionRepository.save(transaction);

        return savedWallet;
    }

    public Wallet getWalletByUsername(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> createWallet(username));
    }

    @Transactional
    public void debit(String username, Double amount, String description) {
        Wallet wallet = getWalletByUsername(username);

        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWalletId(wallet.getId());
        transaction.setUserId(wallet.getUserId());
        transaction.setType(TransactionType.DEBIT);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    @Transactional
    public void credit(String username, Double amount, String description, TransactionType type) {
        Wallet wallet = getWalletByUsername(username);

        wallet.setBalance(wallet.getBalance() + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWalletId(wallet.getId());
        transaction.setUserId(wallet.getUserId());
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    public Double getBalance(String username) {
        Wallet wallet = getWalletByUsername(username);
        return wallet.getBalance();
    }

    public List<WalletTransaction> getTransactions(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // ══════════════════════════════════════════════════════════════
    // SPIN WHEEL (Roue de la chance)
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public Integer spinWheel(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        LocalDate today = LocalDate.now();

        // Vérifier si déjà spin aujourd'hui
        if (spinHistoryRepository.existsByUserIdAndSpinDate(user.getId(), today)) {
            throw new RuntimeException("Already spun today. Come back tomorrow!");
        }

        // Générer points aléatoires (5, 10, 15, 20, 25, 50, 100)
        int[] possiblePoints = {5, 10, 15, 20, 25, 50, 100};
        Random random = new Random();
        int pointsWon = possiblePoints[random.nextInt(possiblePoints.length)];

        // Créditer le wallet
        credit(username, (double) pointsWon, "Daily spin wheel reward", TransactionType.CREDIT);

        // Enregistrer dans historique
        SpinHistory spinHistory = new SpinHistory();
        spinHistory.setUserId(user.getId());
        spinHistory.setSpinDate(today);
        spinHistory.setPointsWon(pointsWon);
        spinHistoryRepository.save(spinHistory);

        return pointsWon;
    }

    // ══════════════════════════════════════════════════════════════
    // CHECK IF CAN SPIN TODAY
    // ══════════════════════════════════════════════════════════════
    public boolean canSpinToday(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        LocalDate today = LocalDate.now();
        return !spinHistoryRepository.existsByUserIdAndSpinDate(user.getId(), today);
    }

    // ══════════════════════════════════════════════════════════════
    // GET SPIN HISTORY
    // ══════════════════════════════════════════════════════════════
    public List<SpinHistory> getSpinHistory(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return spinHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}