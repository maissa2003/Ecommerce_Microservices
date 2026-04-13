package tn.esprit.ms_order.events;

import java.util.List;

public class OrderConfirmedEvent {

    private Long orderId;
    private Long userId;
    private List<OrderItemEvent> items;

    public OrderConfirmedEvent() {}

    public OrderConfirmedEvent(Long orderId, Long userId, List<OrderItemEvent> items) {
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
    }

    // Getters & Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemEvent> getItems() { return items; }
    public void setItems(List<OrderItemEvent> items) { this.items = items; }

    // Classe interne
    public static class OrderItemEvent {
        private Long articleId;
        private int quantity;

        public OrderItemEvent() {}

        public OrderItemEvent(Long articleId, int quantity) {
            this.articleId = articleId;
            this.quantity = quantity;
        }

        public Long getArticleId() { return articleId; }
        public void setArticleId(Long articleId) { this.articleId = articleId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}