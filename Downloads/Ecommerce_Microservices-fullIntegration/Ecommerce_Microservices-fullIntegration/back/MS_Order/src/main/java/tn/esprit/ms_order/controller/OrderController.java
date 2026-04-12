package tn.esprit.ms_order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.ms_order.entities.Order;
import tn.esprit.ms_order.entities.OrderStatus;
import tn.esprit.ms_order.services.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/cart/{userId}")
    public ResponseEntity<Order> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrCreateCart(userId));
    }

    @PostMapping("/cart/{userId}/add")
    public ResponseEntity<Order> addToCart(@PathVariable Long userId,
                                           @RequestParam Long articleId,
                                           @RequestParam String articleName,
                                           @RequestParam Double price,
                                           @RequestParam int quantity) {
        return ResponseEntity.ok(
                orderService.addToCart(userId, articleId, articleName, price, quantity)
        );
    }

    @DeleteMapping("/cart/{userId}/item/{itemId}")
    public ResponseEntity<Order> removeFromCart(@PathVariable Long userId,
                                                @PathVariable Long itemId) {
        return ResponseEntity.ok(orderService.removeFromCart(userId, itemId));
    }

    @PostMapping("/cart/{userId}/confirm")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long userId, @RequestParam(required = false) String promoCode) {
        return ResponseEntity.ok(orderService.confirmOrder(userId, promoCode));
    }

    @PostMapping("/cart/{userId}/apply-promo")
    public ResponseEntity<Order> applyPromo(@PathVariable Long userId, @RequestParam String code) {
        return ResponseEntity.ok(orderService.applyPromoCode(userId, code));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long orderId,
                                              @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancel(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
public ResponseEntity<List<Order>> getAll() {
    return ResponseEntity.ok(orderService.getAllOrders());
}
}