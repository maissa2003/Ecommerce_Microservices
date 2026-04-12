package tn.esprit.ms_feedback.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.ms_feedback.entities.Feedback;
import tn.esprit.ms_feedback.entities.FeedbackDTO;
import tn.esprit.ms_feedback.entities.FeedbackStatus;
import tn.esprit.ms_feedback.repositories.FeedbackRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    // ─── CRUD de base ──────────────────────────────────────────────────────────

    public List<FeedbackDTO> getAll() {
        return feedbackRepository.findAll()
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public FeedbackDTO getById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback introuvable avec l'id : " + id));
        return FeedbackDTO.fromEntity(feedback);
    }

    public FeedbackDTO create(FeedbackDTO dto) {
        // Vérifier si l'utilisateur a déjà donné un feedback sur cet article
        if (feedbackRepository.existsByArticleIdAndUserId(dto.getArticleId(), dto.getUserId())) {
            throw new RuntimeException("Vous avez déjà soumis un feedback pour cet article.");
        }
        Feedback feedback = dto.toEntity();
        Feedback saved = feedbackRepository.save(feedback);
        log.info("Nouveau feedback créé - id={}, articleId={}, userId={}", saved.getId(), saved.getArticleId(), saved.getUserId());
        return FeedbackDTO.fromEntity(saved);
    }

    public FeedbackDTO update(Long id, FeedbackDTO dto) {
        Feedback existing = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback introuvable avec l'id : " + id));
        existing.setComment(dto.getComment());
        existing.setRating(dto.getRating());
        // Repasse en PENDING après modification pour re-modération
        existing.setStatus(FeedbackStatus.PENDING);
        return FeedbackDTO.fromEntity(feedbackRepository.save(existing));
    }

    public void delete(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback introuvable avec l'id : " + id);
        }
        feedbackRepository.deleteById(id);
        log.info("Feedback supprimé - id={}", id);
    }

    // ─── Par article ────────────────────────────────────────────────────────────

    public List<FeedbackDTO> getByArticle(Long articleId) {
        return feedbackRepository.findByArticleId(articleId)
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FeedbackDTO> getApprovedByArticle(Long articleId) {
        return feedbackRepository.findByArticleIdAndStatus(articleId, FeedbackStatus.APPROVED)
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ─── Par utilisateur ────────────────────────────────────────────────────────

    public List<FeedbackDTO> getByUser(Long userId) {
        return feedbackRepository.findByUserId(userId)
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ─── Modération ─────────────────────────────────────────────────────────────

    public List<FeedbackDTO> getPending() {
        return feedbackRepository.findByStatus(FeedbackStatus.PENDING)
                .stream()
                .map(FeedbackDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public FeedbackDTO approve(Long id) {
        return changeStatus(id, FeedbackStatus.APPROVED);
    }

    public FeedbackDTO reject(Long id) {
        return changeStatus(id, FeedbackStatus.REJECTED);
    }

    private FeedbackDTO changeStatus(Long id, FeedbackStatus newStatus) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback introuvable avec l'id : " + id));
        feedback.setStatus(newStatus);
        log.info("Feedback id={} -> statut changé en {}", id, newStatus);
        return FeedbackDTO.fromEntity(feedbackRepository.save(feedback));
    }

    // ─── Statistiques ───────────────────────────────────────────────────────────

    public Double getAverageRating(Long articleId) {
        Double avg = feedbackRepository.findAverageRatingByArticleId(articleId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public long countApproved(Long articleId) {
        return feedbackRepository.countByArticleIdAndStatus(articleId, FeedbackStatus.APPROVED);
    }
}
