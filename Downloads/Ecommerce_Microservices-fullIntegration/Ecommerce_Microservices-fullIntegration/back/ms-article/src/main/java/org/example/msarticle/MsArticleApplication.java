package org.example.msarticle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // ← AJOUT
public class MsArticleApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsArticleApplication.class, args);
    }
}