package tn.esprit.gestionuser.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.PaymentInitiateRequest;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.*;
import tn.esprit.gestionuser.entities.Payment.PaymentMethod;
import tn.esprit.gestionuser.entities.Payment.PaymentStatus;
import tn.esprit.gestionuser.repositories.CouponRepository;
import tn.esprit.gestionuser.repositories.PaymentRepository;
import tn.esprit.gestionuser.repositories.TrainingCourseRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private WalletService walletService;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private TrainingCourseRepository courseRepository;

    @InjectMocks
    private PaymentService paymentService;

    private UserDTO sampleUser;
    private TrainingCourse sampleCourse;
    private Payment samplePayment;

    @BeforeEach
    void setUp() {
        sampleUser = new UserDTO();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");

        sampleCourse = new TrainingCourse();
        sampleCourse.setId(10L);
        sampleCourse.setTitle("Spring Boot");
        sampleCourse.setPrice(100.0);
        sampleCourse.setPointsPrice(1000);
        sampleCourse.setCurrency("USD");

        samplePayment = new Payment();
        samplePayment.setId(1L);
        samplePayment.setUserId(1L);
        samplePayment.setCourseId(10L);
        samplePayment.setStatus(PaymentStatus.PENDING);
        samplePayment.setFinalPrice(100.0);
        samplePayment.setTransactionId("PAY-123456");
    }

    @Test
    @DisplayName("Should initiate wallet payment successfully")
    void initiatePayment_Wallet_ShouldSucceed() {
        PaymentInitiateRequest request = new PaymentInitiateRequest();
        request.setCourseId(10L);
        request.setPaymentMethod("WALLET");

        Wallet wallet = new Wallet();
        wallet.setBalance(2000.0);

        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(sampleCourse));
        when(walletService.getWalletByUsername("testuser")).thenReturn(wallet);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.initiatePayment("testuser", request);

        assertThat(result.getStatus()).isEqualTo(PaymentStatus.APPROVED);
        assertThat(result.getPaymentMethod()).isEqualTo(PaymentMethod.WALLET);
        verify(walletService).debit(eq("testuser"), eq(1000.0), anyString());
    }

    @Test
    @DisplayName("Should throw error if wallet balance insufficient")
    void initiatePayment_Wallet_InsufficientPoints_ShouldThrowException() {
        PaymentInitiateRequest request = new PaymentInitiateRequest();
        request.setCourseId(10L);
        request.setPaymentMethod("WALLET");

        Wallet wallet = new Wallet();
        wallet.setBalance(500.0);

        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(courseRepository.findById(10L)).thenReturn(Optional.of(sampleCourse));
        when(walletService.getWalletByUsername("testuser")).thenReturn(wallet);

        assertThatThrownBy(() -> paymentService.initiatePayment("testuser", request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient points");
    }

    @Test
    @DisplayName("Should approve payment successfully")
    void approvePayment_ShouldUpdateStatus() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(samplePayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.approvePayment(1L, "Looks good");

        assertThat(result.getStatus()).isEqualTo(PaymentStatus.APPROVED);
        assertThat(result.getAdminNotes()).isEqualTo("Looks good");
        assertThat(result.getApprovedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should reject payment and refund if WALLET method")
    void rejectPayment_Wallet_ShouldRefund() {
        samplePayment.setPaymentMethod(PaymentMethod.WALLET);
        samplePayment.setFinalPrice(1000.0);

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(samplePayment));
        when(userClient.getUserById(1L)).thenReturn(sampleUser);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.rejectPayment(1L, "Invalid data");

        assertThat(result.getStatus()).isEqualTo(PaymentStatus.REJECTED);
        verify(walletService).credit(eq("testuser"), eq(1000.0), anyString(), any());
    }

    @Test
    @DisplayName("Should calculate statistics correctly")
    void getStatistics_ShouldReturnMap() {
        samplePayment.setStatus(PaymentStatus.APPROVED);
        samplePayment.setFinalPrice(100.0);
        samplePayment.setCurrency("USD");

        when(paymentRepository.findAll()).thenReturn(Arrays.asList(samplePayment));

        Map<String, Object> stats = paymentService.getStatistics();

        assertThat(stats.get("totalRevenue")).isEqualTo(100.0);
        assertThat(stats.get("approved")).isEqualTo(1L);
    }
}
