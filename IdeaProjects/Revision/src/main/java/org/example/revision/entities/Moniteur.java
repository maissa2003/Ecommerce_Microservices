package org.example.revision.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Moniteur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numMoniteur;

    private String nomM;
    private String prenomM;
    private String adresse;
    private int age;

    @OneToMany(mappedBy = "moniteur")
    private Set<Cours> cours;

    @ManyToMany
    private Set<Piste> pistes;

}
