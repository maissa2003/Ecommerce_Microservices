package tn.esprit.manageusers.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.manageusers.entities.Utilisateur;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);
}
