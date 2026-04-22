package tn.esprit.gestionexam;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@org.junit.jupiter.api.Disabled("Requires live MySQL connection")
@SpringBootTest(properties = "eureka.client.enabled=false")
class GestionExamApplicationTests {

    @Test
    void contextLoads() {
    }

}
