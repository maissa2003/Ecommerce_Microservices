package tn.esprit.gestionsession.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.gestionsession.dto.FormationDTO;

import java.util.List;

@FeignClient(name = "formation-service")  // matches spring.application.name in formation-service
public interface FormationClient {

    @GetMapping("/api/training-courses/{id}")
    FormationDTO getFormationById(@PathVariable("id") Long id);

    @GetMapping("/api/training-courses")
    List<FormationDTO> getAllFormations();
}