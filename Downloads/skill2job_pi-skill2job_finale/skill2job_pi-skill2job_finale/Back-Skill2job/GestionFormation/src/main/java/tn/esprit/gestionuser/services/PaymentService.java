package tn.esprit.gestionuser.services;

import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.dto.PaymentInitiateRequest;
import tn.esprit.gestionuser.entities.Coupon;
import tn.esprit.gestionuser.entities.Payment;
import tn.esprit.gestionuser.entities.Payment.PaymentStatus;
import tn.esprit.gestionuser.entities.Payment.PaymentMethod;
import tn.esprit.gestionuser.entities.TrainingCourse;
import tn.esprit.gestionuser.entities.Wallet;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.repositories.CouponRepository;
import tn.esprit.gestionuser.repositories.PaymentRepository;
import tn.esprit.gestionuser.repositories.TrainingCourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserClient userClient;
    private final WalletService walletService;
    private final CouponRepository couponRepository;
    private final TrainingCourseRepository courseRepository;

    // ══════════════════════════════════════════════════════════════
    // INITIATE PAYMENT
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public Payment initiatePayment(String username, PaymentInitiateRequest request) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        TrainingCourse course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // ── Resolve coupon ────────────────────────────────────────
        double discountPct = 0.0;
        String appliedCouponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Invalid coupon code"));
            if (!coupon.isValid())
                throw new RuntimeException("Coupon expired or inactive");
            discountPct = coupon.getDiscountPercentage();
            appliedCouponCode = coupon.getCode();
        }

        Payment payment = new Payment();
        payment.setUserId(user.getId());
        payment.setCourseId(course.getId());
        payment.setCouponCode(appliedCouponCode);
        payment.setDiscountPercentage(discountPct > 0 ? discountPct : null);
        payment.setAdminNotes(null);

        // ✅ Generate txnId once for all payment methods
        String txnId = "PAY-" + LocalDate.now().toString().replace("-", "")
                + "-" + String.format("%06d", (long) (Math.random() * 1000000));
        payment.setTransactionId(txnId);

        // ── WALLET (points) payment ───────────────────────────────
        if ("WALLET".equals(request.getPaymentMethod())) {
            // ✅ Use doubleValue() to avoid lossy conversion
            double pointsPrice = course.getPointsPrice() != null
                    ? course.getPointsPrice().doubleValue()
                    : 0.0;

            if (pointsPrice <= 0)
                throw new RuntimeException("This course is not available for points payment");

            double finalPoints = Math.ceil(pointsPrice * (1 - discountPct / 100.0));

            Wallet wallet = walletService.getWalletByUsername(username);
            if (wallet.getBalance() < finalPoints)
                throw new RuntimeException("Insufficient points. Need "
                        + (int) Math.ceil(finalPoints) + " pts, have "
                        + wallet.getBalance().intValue() + " pts");

            payment.setOriginalPrice(pointsPrice);
            payment.setFinalPrice(finalPoints);
            payment.setCurrency("PTS");
            payment.setPaymentMethod(PaymentMethod.WALLET);
            payment.setStatus(PaymentStatus.APPROVED); // instant, no admin needed
            payment.setApprovedAt(LocalDateTime.now());

            Payment saved = paymentRepository.save(payment);
            walletService.debit(username, finalPoints,
                    "Course purchase: " + course.getTitle());
            return saved;
        }

        // ── CREDIT_CARD / BANK_TRANSFER ───────────────────────────
        double originalPrice = request.getAmount() != null
                ? request.getAmount()
                : course.getPrice();
        double finalPrice = originalPrice * (1 - discountPct / 100.0);

        payment.setOriginalPrice(originalPrice);
        payment.setFinalPrice(finalPrice);
        payment.setCurrency(request.getCurrency() != null
                ? request.getCurrency()
                : course.getCurrency());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCardHolderName(request.getCardHolderName());
        payment.setCardLast4(request.getCardLast4());
        payment.setCardType(request.getCardType());
        payment.setBillingCountry(request.getBillingCountry());

        return paymentRepository.save(payment);
    }

    // ══════════════════════════════════════════════════════════════
    // APPROVE PAYMENT (ADMIN)
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public Payment approvePayment(Long paymentId, String adminNotes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING)
            throw new RuntimeException("Only pending payments can be approved");

        payment.setStatus(PaymentStatus.APPROVED);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setAdminNotes(adminNotes);

        return paymentRepository.save(payment);
    }

    // ══════════════════════════════════════════════════════════════
    // REJECT PAYMENT (ADMIN)
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public Payment rejectPayment(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING)
            throw new RuntimeException("Only pending payments can be rejected");

        payment.setStatus(PaymentStatus.REJECTED);
        payment.setRejectedAt(LocalDateTime.now());
        payment.setAdminNotes(reason);

        // Refund points if wallet payment
        if (payment.getPaymentMethod() == PaymentMethod.WALLET) {
            UserDTO user = userClient.getUserById(payment.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            walletService.credit(user.getUsername(), payment.getFinalPrice(),
                    "Refund for rejected payment: " + payment.getTransactionId(),
                    TransactionType.REFUND);
        }

        return paymentRepository.save(payment);
    }

    // ══════════════════════════════════════════════════════════════
    // REFUND PAYMENT (ADMIN)
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public Payment refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.APPROVED)
            throw new RuntimeException("Only approved payments can be refunded");

        payment.setStatus(PaymentStatus.REFUNDED);

        // Refund points if wallet payment
        if (payment.getPaymentMethod() == PaymentMethod.WALLET) {
            UserDTO user = userClient.getUserById(payment.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            walletService.credit(user.getUsername(), payment.getFinalPrice(),
                    "Refund for transaction: " + payment.getTransactionId(),
                    TransactionType.REFUND);
        }

        return paymentRepository.save(payment);
    }

    // ══════════════════════════════════════════════════════════════
    // GET PENDING PAYMENTS (ADMIN)
    // ══════════════════════════════════════════════════════════════
    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING);
    }

    // ══════════════════════════════════════════════════════════════
    // GET ALL PAYMENTS (ADMIN)
    // ══════════════════════════════════════════════════════════════
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    // ══════════════════════════════════════════════════════════════
    // GET MY PAYMENTS (USER)
    // ══════════════════════════════════════════════════════════════
    public List<Payment> getMyPayments(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return paymentRepository.findByUserId(user.getId());
    }

    // ══════════════════════════════════════════════════════════════
    // CHECK ACCESS (USER)
    // ══════════════════════════════════════════════════════════════
    public boolean hasAccessToCourse(String username, Long courseId) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return paymentRepository.existsByUserIdAndCourseIdAndStatus(
                user.getId(), courseId, PaymentStatus.APPROVED);
    }

    // ══════════════════════════════════════════════════════════════
    // STATISTICS (ADMIN)
    // ══════════════════════════════════════════════════════════════
    public Map<String, Object> getStatistics() {
        List<Payment> all = paymentRepository.findAll();

        long pending  = all.stream().filter(p -> p.getStatus() == PaymentStatus.PENDING).count();
        long approved = all.stream().filter(p -> p.getStatus() == PaymentStatus.APPROVED).count();
        long rejected = all.stream().filter(p -> p.getStatus() == PaymentStatus.REJECTED).count();

        // Currency revenue only (exclude points payments)
        double revenue = all.stream()
                .filter(p -> p.getStatus() == PaymentStatus.APPROVED
                        && !"PTS".equals(p.getCurrency()))
                .mapToDouble(Payment::getFinalPrice)
                .sum();

        // Points spent on courses
        double pointsSpent = all.stream()
                .filter(p -> p.getStatus() == PaymentStatus.APPROVED
                        && "PTS".equals(p.getCurrency()))
                .mapToDouble(Payment::getFinalPrice)
                .sum();

        return Map.of(
                "totalPayments",    all.size(),
                "pending",          pending,
                "approved",         approved,
                "rejected",         rejected,
                "totalRevenue",     revenue,
                "totalPointsSpent", pointsSpent
        );
    }

    // ══════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════
    private String generateTransactionId() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = paymentRepository.count() + 1;
        return "PAY-" + date + "-" + String.format("%06d", count);
    }

    private boolean luhnCheck(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(cardNumber.charAt(i));
            if (alternate) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    private String getCardType(String cardNumber) {
        String clean = cardNumber.replaceAll("\\s", "");
        if (clean.startsWith("4")) return "VISA";
        if (clean.startsWith("5")) return "MASTERCARD";
        if (clean.startsWith("3")) return "AMEX";
        return "UNKNOWN";
    }
}