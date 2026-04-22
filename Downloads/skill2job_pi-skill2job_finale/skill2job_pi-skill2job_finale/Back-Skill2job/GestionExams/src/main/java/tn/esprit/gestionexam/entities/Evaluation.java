package tn.esprit.gestionexam.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Double score;
    private Boolean passed;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnoreProperties({"evaluations", "questions"})
    private Examen exam;

    @OneToOne(mappedBy = "evaluation", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("evaluation")
    private Certificate certificate;

    // ← Persist user's answers with the evaluation
    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("evaluation")  // ← break circular ref

    private List<UserAnswer> answers = new ArrayList<>();

    @JsonProperty("examId")
    public Long getExamId() {
        return exam != null ? exam.getId() : null;
    }
}