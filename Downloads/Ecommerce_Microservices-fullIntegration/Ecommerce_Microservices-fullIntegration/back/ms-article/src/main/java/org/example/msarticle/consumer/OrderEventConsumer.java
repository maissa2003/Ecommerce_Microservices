package org.example.msarticle.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.example.msarticle.ArticleRepository;
import org.example.msarticle.events.OrderConfirmedEvent;

@Component
public class OrderEventConsumer {

    @Autowired
    private ArticleRepository articleRepository;

    @RabbitListener(queues = "order.confirmed.queue")
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        System.out.println("RabbitMQ reçu : commande #" + event.getOrderId());

        if (event.getItems() == null) return;

        event.getItems().forEach(item -> {
            articleRepository.findById(item.getArticleId()).ifPresent(article -> {
                int newStock = article.getStock() - item.getQuantity();

                // Empêcher stock négatif
                if (newStock < 0) newStock = 0;

                article.setStock(newStock);
                articleRepository.save(article);

                System.out.println("Stock article #" + article.getId()
                        + " mis à jour : " + newStock);
            });
        });
    }
}
