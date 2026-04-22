package tn.esprit.gestionuser.repositories;

import tn.esprit.gestionuser.entities.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}