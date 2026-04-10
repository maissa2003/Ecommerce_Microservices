package tn.esprit.ms_feedback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsFeedbackApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsFeedbackApplication.class, args);
    }
}
