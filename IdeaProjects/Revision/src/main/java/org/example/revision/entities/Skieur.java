package org.example.revision.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Skieur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numSkieur;

    private String nomS;
    private String prenomS;
    private LocalDate dateNaissance;
    private String ville;

    @OneToMany(mappedBy = "skieur")
    private Set<Abonnement> abonnements;

    @OneToMany(mappedBy = "skieur")
    private Set<Inscription> inscriptions;

    @ManyToMany(mappedBy = "skieurs")
    private Set<Piste> pistes;
}
