package tn.esprit.gestionexam.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionexam.entities.Certificate;
import tn.esprit.gestionexam.entities.Evaluation;

import java.time.LocalDate;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Certificate findByEvaluation(Evaluation evaluation);

    List<Certificate> findByEvaluationUserId(Long userId);

    @Query("SELECT c FROM Certificate c WHERE c.evaluation.exam.id = :examId")
    List<Certificate> findByExamId(@Param("examId") Long examId);

    Certificate findByCertificateCode(String certificateCode);

    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.evaluation.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Certificate c WHERE c.issueDate BETWEEN :startDate AND :endDate")
    List<Certificate> findByIssueDateBetween(@Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);
}