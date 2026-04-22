package tn.esprit.api_gateway_pi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient

public class ApiGatewayPiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayPiApplication.class, args);
    }

}
