package tn.esprit.eurekaserverweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer

public class EurekaServerWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerWebApplication.class, args);
    }

}
