package tn.esprit.ms_order.services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.ms_order.config.RabbitMQConfig;
import tn.esprit.ms_order.entities.*;
import tn.esprit.ms_order.events.OrderConfirmedEvent;
import tn.esprit.ms_order.repositories.OrderRepository;
import tn.esprit.ms_order.repositories.PromoCodeRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final RabbitTemplate rabbitTemplate; // ← AJOUT

    public OrderService(OrderRepository orderRepository,
                        PromoCodeRepository promoCodeRepository,
                        RabbitTemplate rabbitTemplate) { // ← AJOUT
        this.orderRepository = orderRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.rabbitTemplate = rabbitTemplate; // ← AJOUT
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

    public Order applyPromoCode(Long userId, String promoCodeStr) {
        Order cart = orderRepository
                .findByUserIdAndStatus(userId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("No active cart found for user: " + userId));

        if (cart.getItems().isEmpty())
            throw new RuntimeException("Cart is empty");

        if (promoCodeStr == null || promoCodeStr.trim().isEmpty()) {
            cart.setPromoCode(null);
            cart.setDiscountAmount(0.0);
            return orderRepository.save(cart);
        }

        PromoCode pc = promoCodeRepository.findByCode(promoCodeStr)
                .orElseThrow(() -> new RuntimeException("Code promo invalide."));

        if (!pc.getActive() || pc.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Ce code promo est expiré ou inactif.");
        }
        if (pc.getCurrentUsages() >= pc.getMaxUsages()) {
            throw new RuntimeException("La limite d'utilisation de ce code est atteinte.");
        }

        double subTotal = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        double discount = 0.0;
        if (pc.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subTotal * (pc.getValue() / 100.0);
        } else {
            discount = pc.getValue();
        }

        cart.setPromoCode(pc);
        cart.setDiscountAmount(discount);
        return orderRepository.save(cart);
    }

    public Order confirmOrder(Long userId, String promoCodeStr) {
        Order cart = orderRepository
                .findByUserIdAndStatus(userId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("No active cart for user: " + userId));

        if (cart.getItems().isEmpty())
            throw new RuntimeException("Cart is empty");

        if (promoCodeStr != null && !promoCodeStr.trim().isEmpty()) {
            applyPromoCode(userId, promoCodeStr);
            cart = orderRepository.findById(cart.getId()).get();
        }

        if (cart.getPromoCode() != null) {
            PromoCode pc = cart.getPromoCode();
            pc.setCurrentUsages(pc.getCurrentUsages() + 1);
            promoCodeRepository.save(pc);
        }

        cart.setStatus(OrderStatus.CONFIRMED);
        Order confirmed = orderRepository.save(cart);

        // ── AJOUT : Publier l'event RabbitMQ ─────────────────────────
        List<OrderConfirmedEvent.OrderItemEvent> itemEvents = confirmed.getItems()
                .stream()
                .map(i -> new OrderConfirmedEvent.OrderItemEvent(
                        i.getArticleId(),
                        i.getQuantity()
                ))
                .collect(Collectors.toList());

        OrderConfirmedEvent event = new OrderConfirmedEvent(
                confirmed.getId(),
                confirmed.getUserId(),
                itemEvents
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                event
        );
        // ─────────────────────────────────────────────────────────────

        return confirmed;
    }

    public List<Order> getOrdersByUser(Long userId) {
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
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findByStatusNot(OrderStatus.CART);
    }
}