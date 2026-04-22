package tn.esprit.gestionexam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient

public class GestionExamApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionExamApplication.class, args);
    }

}
