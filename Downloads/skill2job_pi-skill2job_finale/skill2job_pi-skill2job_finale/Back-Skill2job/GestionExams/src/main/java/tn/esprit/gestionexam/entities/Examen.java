package tn.esprit.gestionexam.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double passScore;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("exam")
    private List<Evaluation> evaluations = new ArrayList<>();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("exam")
    private List<Question> questions = new ArrayList<>();
}