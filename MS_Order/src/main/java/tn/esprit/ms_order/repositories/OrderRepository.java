package tn.esprit.ms_order.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.ms_order.entities.Order;
import tn.esprit.ms_order.entities.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Optional<Order> findByUserIdAndStatus(Long userId, OrderStatus status);
}