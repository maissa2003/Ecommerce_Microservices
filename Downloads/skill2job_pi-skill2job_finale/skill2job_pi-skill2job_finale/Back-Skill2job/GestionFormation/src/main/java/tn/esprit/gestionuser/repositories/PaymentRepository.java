package tn.esprit.gestionuser.repositories;

import tn.esprit.gestionuser.entities.Payment;
import tn.esprit.gestionuser.entities.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserId(Long userId);

    List<Payment> findByCourseId(Long courseId);

    List<Payment> findByStatus(PaymentStatus status);

    Optional<Payment> findByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);

    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);

    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    List<Payment> findAllByOrderByCreatedAtDesc();
}