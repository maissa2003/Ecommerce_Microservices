package tn.esprit.gestionsession.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.gestionsession.dto.UserDTO;

@FeignClient(name = "ms-user")   // matches spring.application.name in ms-user
public interface UserClient {

    @GetMapping("/api/admin/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);

    @GetMapping("/api/admin/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}