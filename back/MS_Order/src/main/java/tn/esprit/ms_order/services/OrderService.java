package tn.esprit.ms_order.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.ms_order.entities.Order;
import tn.esprit.ms_order.entities.OrderItem;
import tn.esprit.ms_order.entities.OrderStatus;
import tn.esprit.ms_order.repositories.OrderRepository;
import tn.esprit.ms_order.repositories.PromoCodeRepository;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final tn.esprit.ms_order.repositories.PromoCodeRepository promoCodeRepository;
    public OrderService(OrderRepository orderRepository, tn.esprit.ms_order.repositories.PromoCodeRepository promoCodeRepository) {
        this.orderRepository = orderRepository;
        this.promoCodeRepository = promoCodeRepository;
    }

    public Order getOrCreateCart(Long userId) {
        return orderRepository
                .findByUserIdAndStatus(userId, OrderStatus.CART)
                .orElseGet(() -> {
                    Order cart = new Order();
                    cart.setUserId(userId);
                    cart.setStatus(OrderStatus.CART);
                    return orderRepository.save(cart);
                });
    }

    public Order addToCart(Long userId, Long articleId,
                           String articleName, Double price, int quantity) {
        Order cart = getOrCreateCart(userId);

        // Check if article already in cart, just update quantity
        cart.getItems().stream()
                .filter(i -> i.getArticleId().equals(articleId))
                .findFirst()
                .ifPresentOrElse(
                        i -> i.setQuantity(i.getQuantity() + quantity),
                        () -> {
                            OrderItem item = new OrderItem();
                            item.setOrder(cart);
                            item.setArticleId(articleId);
                            item.setArticleName(articleName);
                            item.setPrice(price);
                            item.setQuantity(quantity);
                            cart.getItems().add(item);
                        }
                );

        return orderRepository.save(cart);
    }

    public Order removeFromCart(Long userId, Long itemId) {
        Order cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return orderRepository.save(cart);
    }

    public Order confirmOrder(Long userId, String promoCodeStr) {
        Order cart = orderRepository
                .findByUserIdAndStatus(userId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("No active cart for user: " + userId));

        if (cart.getItems().isEmpty())
            throw new RuntimeException("Cart is empty");

        if (promoCodeStr != null && !promoCodeStr.trim().isEmpty()) {
            tn.esprit.ms_order.entities.PromoCode pc = promoCodeRepository.findByCode(promoCodeStr)
                    .orElseThrow(() -> new RuntimeException("Invalid promo code."));
            
            if (!pc.getActive() || pc.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Promo code expired or inactive.");
            }
            if (pc.getCurrentUsages() >= pc.getMaxUsages()) {
                throw new RuntimeException("Promo code usage limit reached.");
            }

            double subTotal = cart.getItems().stream()
                    .mapToDouble(i -> i.getPrice() * i.getQuantity())
                    .sum();
            
            double discount = 0.0;
            if (pc.getDiscountType() == tn.esprit.ms_order.entities.DiscountType.PERCENTAGE) {
                discount = subTotal * (pc.getValue() / 100.0);
            } else {
                discount = pc.getValue();
            }

            cart.setPromoCode(pc);
            cart.setDiscountAmount(discount);
            pc.setCurrentUsages(pc.getCurrentUsages() + 1);
            promoCodeRepository.save(pc);
        }

        // Later: call articleClient.reduceStock() for each item
        cart.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(cart);
    }

    public List<Order> getOrdersByUser(Long userId) {
        // Hide the active cart from the "orders history" view
        return orderRepository.findByUserIdAndStatusNot(userId, OrderStatus.CART);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long orderId) {
        // Admin "delete" should work for any status.
        // Cascade + orphanRemoval will delete items as well.
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }
    public List<Order> getAllOrders() {
        // Hide CART from the admin orders table
        return orderRepository.findByStatusNot(OrderStatus.CART);
}
}