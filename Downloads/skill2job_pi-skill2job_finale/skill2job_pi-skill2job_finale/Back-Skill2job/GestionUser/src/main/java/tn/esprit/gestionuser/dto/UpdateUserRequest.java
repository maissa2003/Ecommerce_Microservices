package tn.esprit.gestionuser.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String password;        // optionnel
    private Set<String> roles;      // optionnel
}