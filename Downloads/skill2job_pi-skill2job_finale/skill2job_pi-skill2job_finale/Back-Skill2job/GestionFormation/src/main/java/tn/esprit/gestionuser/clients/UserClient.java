package tn.esprit.gestionuser.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.gestionuser.dto.UserDTO;

@FeignClient(name = "gestionuser")
public interface UserClient {

    @GetMapping("/api/admin/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/admin/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);
}
