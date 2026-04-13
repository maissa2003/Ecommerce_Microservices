package org.example.msarticle.events;

import java.util.List;

public class OrderConfirmedEvent {

    private Long orderId;
    private Long userId;
    private List<OrderItemEvent> items;

    public OrderConfirmedEvent() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemEvent> getItems() { return items; }
    public void setItems(List<OrderItemEvent> items) { this.items = items; }

    public static class OrderItemEvent {
        private Long articleId;
        private int quantity;

        public OrderItemEvent() {}

        public Long getArticleId() { return articleId; }
        public void setArticleId(Long articleId) { this.articleId = articleId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
