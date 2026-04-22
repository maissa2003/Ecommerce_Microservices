package tn.esprit.gestionexam.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionexam.entities.UserAnswer;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    List<UserAnswer> findByEvaluationId(Long evaluationId);
}
