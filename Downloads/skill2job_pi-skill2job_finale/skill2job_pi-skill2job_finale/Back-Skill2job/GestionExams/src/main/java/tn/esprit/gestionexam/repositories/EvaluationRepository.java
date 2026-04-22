package tn.esprit.gestionexam.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionexam.entities.Evaluation;
import tn.esprit.gestionexam.entities.Examen;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByExam(Examen exam);

    @Query("SELECT e FROM Evaluation e WHERE e.exam.id = :examId")
    List<Evaluation> findByExamId(@Param("examId") Long examId);

    List<Evaluation> findByUserId(Long userId);

    List<Evaluation> findByPassedTrue();

    List<Evaluation> findByPassedFalse();

    List<Evaluation> findByUserIdAndPassed(Long userId, Boolean passed);

    @Query("SELECT e FROM Evaluation e WHERE e.exam.id = :examId AND e.passed = :passed")
    List<Evaluation> findByExamIdAndPassed(@Param("examId") Long examId, @Param("passed") Boolean passed);

    @Query("SELECT AVG(e.score) FROM Evaluation e WHERE e.exam.id = :examId")
    Double getAverageScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT COUNT(e) FROM Evaluation e WHERE e.exam.id = :examId AND e.passed = true")
    Long countPassedByExamId(@Param("examId") Long examId);
}
