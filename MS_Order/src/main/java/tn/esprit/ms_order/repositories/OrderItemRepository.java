package tn.esprit.ms_order.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.ms_order.entities.OrderItem;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
}