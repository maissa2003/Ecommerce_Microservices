package tn.esprit.gestionsession.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Bloc {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    private String nom;
    private String location;
    @OneToMany(mappedBy = "bloc", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("bloc")
    private List<Salle> salles;
}
