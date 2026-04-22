package tn.esprit.gestionuser.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.repositories.SpinHistoryRepository;
import tn.esprit.gestionuser.repositories.WalletRepository;
import tn.esprit.gestionuser.repositories.WalletTransactionRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WalletService Unit Tests")
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private SpinHistoryRepository spinHistoryRepository;

    @InjectMocks
    private WalletService walletService;

    private UserDTO sampleUser;
    private Wallet sampleWallet;

    @BeforeEach
    void setUp() {
        sampleUser = new UserDTO();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");

        sampleWallet = new Wallet();
        sampleWallet.setId(1L);
        sampleWallet.setUserId(1L);
        sampleWallet.setBalance(100.0);
        sampleWallet.setCurrency("USD");
    }

    @Test
    @DisplayName("Should create wallet successfully")
    void createWallet_ShouldReturnSavedWallet() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(walletRepository.existsByUserId(1L)).thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenReturn(sampleWallet);

        Wallet result = walletService.createWallet("testuser");

        assertThat(result).isNotNull();
        assertThat(result.getBalance()).isEqualTo(100.0);
        verify(transactionRepository).save(any(WalletTransaction.class));
    }

    @Test
    @DisplayName("Should debit successfully when balance is enough")
    void debit_WithEnoughBalance_ShouldSucceed() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(sampleWallet));

        walletService.debit("testuser", 40.0, "Buying course");

        assertThat(sampleWallet.getBalance()).isEqualTo(60.0);
        verify(walletRepository).save(sampleWallet);
        verify(transactionRepository).save(any(WalletTransaction.class));
    }

    @Test
    @DisplayName("Should throw error if debit balance is insufficient")
    void debit_WithInsufficientBalance_ShouldThrowException() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(sampleWallet));

        assertThatThrownBy(() -> walletService.debit("testuser", 200.0, "Expensive item"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient balance");
    }

    @Test
    @DisplayName("Should credit successfully")
    void credit_ShouldIncreaseBalance() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(sampleWallet));

        walletService.credit("testuser", 50.0, "Refund", TransactionType.CREDIT);

        assertThat(sampleWallet.getBalance()).isEqualTo(150.0);
        verify(walletRepository).save(sampleWallet);
    }

    @Test
    @DisplayName("Should spin wheel and win points")
    void spinWheel_WhenCanSpin_ShouldWinPoints() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(spinHistoryRepository.existsByUserIdAndSpinDate(any(), any())).thenReturn(false);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(sampleWallet));

        Integer points = walletService.spinWheel("testuser");

        assertThat(points).isNotNull();
        verify(walletRepository).save(any(Wallet.class));
        verify(spinHistoryRepository).save(any());
    }
}
