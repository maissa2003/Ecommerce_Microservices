package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import org.example.revision.Repositories.*;
import org.example.revision.entities.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class StationSkiServiceImpl {

    private final SkieurRepository skieurRepository;
    private final AbonnementRepository abonnementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final CoursRepository coursRepository;
    private final MoniteurRepository moniteurRepository;
    private final PisteRepository pisteRepository;

    // 1. Ajouter une inscription et l'affecter à un skieur
    public Inscription addRegistrationAndAssignToSkier(Inscription inscription, Long numSkieur) {
        Skieur skieur = skieurRepository.findById(numSkieur).orElseThrow();
        inscription.setSkieur(skieur);
        return inscriptionRepository.save(inscription);
    }

    // 2. Affecter une inscription à un cours
    public Inscription assignRegistrationToCourse(Long numInscription, Long numCourse) {
        Inscription inscription = inscriptionRepository.findById(numInscription).orElseThrow();
        Cours cours = coursRepository.findById(numCourse).orElseThrow();
        inscription.setCours(cours);
        return inscriptionRepository.save(inscription);
    }

    // 3. Affecter un skieur à une piste
    public Skieur assignSkierToPiste(Long numSkieur, Long numPiste) {
        Skieur skieur = skieurRepository.findById(numSkieur).orElseThrow();
        Piste piste = pisteRepository.findById(numPiste).orElseThrow();
        skieur.getPistes().add(piste);
        piste.getSkieurs().add(skieur);
        skieurRepository.save(skieur);
        pisteRepository.save(piste);
        return skieur;
    }

    // 4. Ajouter un moniteur et l'affecter à un cours
    public Moniteur addInstructorAndAssignToCourse(Moniteur moniteur, Long numCourse) {
        Cours cours = coursRepository.findById(numCourse).orElseThrow();
        moniteur.getCours().add(cours);
        cours.setMoniteur(moniteur);
        moniteurRepository.save(moniteur);
        coursRepository.save(cours);
        return moniteur;
    }

    // 5. Ajouter un skieur + abonnement + inscription et l'affecter à un cours
    public Skieur addSkierAndAssignToCourse(Skieur skieur, Long numCourse) {
        // Enregistrer skieur
        skieurRepository.save(skieur);

        // Enregistrer les abonnements liés
        if (skieur.getAbonnements() != null) {
            for (Abonnement abo : skieur.getAbonnements()) {
                abo.setSkieur(skieur);
                abonnementRepository.save(abo);
            }
        }

        // Enregistrer les inscriptions liées et affecter au cours
        if (skieur.getInscriptions() != null) {
            Cours cours = coursRepository.findById(numCourse).orElseThrow();
            for (Inscription insc : skieur.getInscriptions()) {
                insc.setSkieur(skieur);
                insc.setCours(cours);
                inscriptionRepository.save(insc);
            }
        }

        return skieur;
    }

    // 6. Récupérer les skieurs selon leur type d’abonnement
    public List<Skieur> retrieveSkiersBySubscriptionType(TypeAbonnement typeAbonnement) {
        return skieurRepository.findByAbonnementsTypeAbonnement(typeAbonnement);
    }

    // 7. Récupérer abonnements par type et triés par date
    public Set<Abonnement> getSubscriptionByType(TypeAbonnement type) {
        return abonnementRepository.findByTypeAbonnementOrderByDateDebut(type);
    }

    // 8. Afficher abonnements créés entre deux dates
    public List<Abonnement> retrieveSubscriptionsByDates(LocalDate startDate, LocalDate endDate) {
        return abonnementRepository.findByDateDebutBetween(startDate, endDate);
    }

    // 9. Ajouter une inscription et l’affecter à un skieur et à un cours (limite 6 pour collectif)
    public Inscription addRegistrationAndAssignToSkierAndCourse(
            Inscription inscription, Long numSkieur, Long numCours) {

        Skieur skieur = skieurRepository.findById(numSkieur).orElseThrow();
        Cours cours = coursRepository.findById(numCours).orElseThrow();

        // Vérification si cours collectif limité à 6 skieurs
        if (cours.getTypeCours().toUpperCase().contains("COLLECTIF") &&
                cours.getInscriptions().size() >= 6) {
            throw new RuntimeException("Cours collectif complet");
        }

        // Vérification âge pour cours enfant
        int age = LocalDate.now().getYear() - skieur.getDateNaissance().getYear();
        if (cours.getTypeCours().toUpperCase().contains("ENFANT") && age > 12) {
            throw new RuntimeException("Skieur trop âgé pour cours enfant");
        }

        inscription.setSkieur(skieur);
        inscription.setCours(cours);
        return inscriptionRepository.save(inscription);
    }

    // 10. Numéros des semaines où un moniteur a donné des cours selon un support
    public List<Integer> numWeeksCourseOfInstructorBySupport(Long numInstructor, String support) {
        Moniteur moniteur = moniteurRepository.findById(numInstructor).orElseThrow();
        // Exemple simple : récupérer toutes les semaines des cours du moniteur pour le support donné
        return moniteur.getCours().stream()
                .filter(c -> c.getTypeCours().equalsIgnoreCase(support))
                .map(Cours::getCreneau)
                .toList();
    }
}
