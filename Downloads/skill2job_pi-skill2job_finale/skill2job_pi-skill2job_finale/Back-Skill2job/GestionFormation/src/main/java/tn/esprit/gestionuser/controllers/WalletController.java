package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction;
import tn.esprit.gestionuser.entities.SpinHistory;
import tn.esprit.gestionuser.services.WalletService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // ══════════════════════════════════════════════════════════════
    // GET MY WALLET
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<Wallet> getMyWallet(Authentication authentication) {
        String username = authentication.getName();
        Wallet wallet = walletService.getWalletByUsername(username);
        return ResponseEntity.ok(wallet);
    }

    // ══════════════════════════════════════════════════════════════
    // GET MY BALANCE
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/balance")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Double>> getBalance(Authentication authentication) {
        String username = authentication.getName();
        Double balance = walletService.getBalance(username);
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    // ══════════════════════════════════════════════════════════════
    // GET MY TRANSACTIONS
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<List<WalletTransaction>> getTransactions(Authentication authentication) {
        String username = authentication.getName();
        List<WalletTransaction> transactions = walletService.getTransactions(username);
        return ResponseEntity.ok(transactions);
    }

    // ══════════════════════════════════════════════════════════════
    // CHECK IF CAN SPIN TODAY
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/can-spin")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> canSpin(Authentication authentication) {
        String username = authentication.getName();
        boolean canSpin = walletService.canSpinToday(username);
        return ResponseEntity.ok(Map.of("canSpin", canSpin));
    }

    // ══════════════════════════════════════════════════════════════
    // SPIN THE WHEEL
    // ══════════════════════════════════════════════════════════════
    @PostMapping("/spin")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<?> spinWheel(Authentication authentication) {
        try {
            String username = authentication.getName();
            Integer pointsWon = walletService.spinWheel(username);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "pointsWon", pointsWon,
                    "message", "You won " + pointsWon + " points! Keep spinning daily to earn more!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GET SPIN HISTORY


    // ══════════════════════════════════════════════════════════════
    @GetMapping("/spin-history")
    @PreAuthorize("hasAnyAuthority('ROLE_LEARNER', 'ROLE_ADMIN')")
    public ResponseEntity<List<SpinHistory>> getSpinHistory(Authentication authentication) {
        String username = authentication.getName();
        List<SpinHistory> history = walletService.getSpinHistory(username);
        return ResponseEntity.ok(history);
    }

    // ══════════════════════════════════════════════════════════════
    // ADD CREDIT (ADMIN)
    // ══════════════════════════════════════════════════════════════
    @PostMapping("/add-credit")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> addCredit(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            Double amount = Double.valueOf(request.get("amount").toString());
            String description = (String) request.getOrDefault("description", "Credit added by admin");

            walletService.credit(username, amount, description,
                    tn.esprit.gestionuser.entities.WalletTransaction.TransactionType.CREDIT);

            return ResponseEntity.ok(Map.of("message", "Credit added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}