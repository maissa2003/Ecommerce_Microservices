package tn.esprit.gestionpartner.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String password;
    private Set<String> roles;
}
