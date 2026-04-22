package tn.esprit.gestionpartner.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import tn.esprit.gestionpartner.dto.UpdateUserRequest;
import tn.esprit.gestionpartner.dto.UserDTO;

@FeignClient(name = "gestionuser", url = "http://gestionuser:8089/api")
public interface UserClient {

    @GetMapping("/admin/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/admin/users/by-username/{username}")
    UserDTO getUserByUsername(@PathVariable("username") String username);

    @PutMapping("/admin/users/{id}")
    UserDTO updateUser(@PathVariable("id") Long id, UpdateUserRequest request);

    @DeleteMapping("/admin/users/{id}")
    void deleteUser(@PathVariable("id") Long id);
}
