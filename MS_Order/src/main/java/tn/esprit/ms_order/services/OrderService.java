package tn.esprit.ms_order.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.ms_order.entities.Order;
import tn.esprit.ms_order.entities.OrderItem;
import tn.esprit.ms_order.entities.OrderStatus;
import tn.esprit.ms_order.repositories.OrderRepository;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
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

    public Order confirmOrder(Long userId) {
        Order cart = orderRepository
                .findByUserIdAndStatus(userId, OrderStatus.CART)
                .orElseThrow(() -> new RuntimeException("No active cart for user: " + userId));

        if (cart.getItems().isEmpty())
            throw new RuntimeException("Cart is empty");

        // Later: call articleClient.reduceStock() for each item
        cart.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(cart);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
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

    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != OrderStatus.CART)
            throw new RuntimeException("Can only cancel orders in CART status");
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}