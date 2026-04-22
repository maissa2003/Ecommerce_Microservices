package tn.esprit.gestionexam.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.entities.Question;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExam(Examen exam);
    @Query("SELECT q FROM Question q WHERE q.exam.id = :examId")
    List<Question> findByExamId(@Param("examId") Long examId);
}
