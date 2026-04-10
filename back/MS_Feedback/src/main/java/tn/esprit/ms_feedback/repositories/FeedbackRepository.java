package tn.esprit.ms_feedback.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.ms_feedback.entities.Feedback;
import tn.esprit.ms_feedback.entities.FeedbackStatus;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Tous les feedbacks d'un article
    List<Feedback> findByArticleId(Long articleId);

    // Feedbacks approuvés d'un article
    List<Feedback> findByArticleIdAndStatus(Long articleId, FeedbackStatus status);

    // Tous les feedbacks d'un utilisateur
    List<Feedback> findByUserId(Long userId);

    // Feedbacks par statut
    List<Feedback> findByStatus(FeedbackStatus status);

    // Vérifier si un utilisateur a déjà posté un feedback sur un article
    boolean existsByArticleIdAndUserId(Long articleId, Long userId);

    // Moyenne des ratings pour un article (seulement les approuvés)
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.articleId = :articleId AND f.status = 'APPROVED'")
    Double findAverageRatingByArticleId(@Param("articleId") Long articleId);

    // Nombre de feedbacks approuvés par article
    long countByArticleIdAndStatus(Long articleId, FeedbackStatus status);
}
