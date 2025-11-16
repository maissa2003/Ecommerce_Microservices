package org.example.revision.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Piste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numPiste;

    private String nomPiste;
    private String couleur;
    private int longueur;
    private int pente;

    @ManyToMany
    private Set<Skieur> skieurs;

    @ManyToMany(mappedBy = "pistes")
    private Set<Moniteur> moniteurs;

}
