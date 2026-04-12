package tn.esprit.manageusers.services;

import org.springframework.stereotype.Service;
import tn.esprit.manageusers.entities.Utilisateur;
import tn.esprit.manageusers.repositories.UtilisateurRepository;

import java.util.List;

@Service
public class UtilisateurService {

    private final UtilisateurRepository repo;

    public UtilisateurService(UtilisateurRepository repo) {
        this.repo = repo;
    }

    public List<Utilisateur> getAll() {
        return repo.findAll();
    }

    public Utilisateur getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Utilisateur add(Utilisateur u) {
        return repo.save(u);
    }

    public Utilisateur update(Long id, Utilisateur u) {
        Utilisateur existing = getById(id);
        existing.setNom(u.getNom());
        existing.setEmail(u.getEmail());
        existing.setPassword(u.getPassword());
        existing.setRole(u.getRole());
        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}