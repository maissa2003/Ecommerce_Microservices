package tn.esprit.ms_feedback.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.ms_feedback.entities.Feedback;
import tn.esprit.ms_feedback.entities.FeedbackDTO;
import tn.esprit.ms_feedback.entities.FeedbackStatus;
import tn.esprit.ms_feedback.repositories.FeedbackRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    // ─── ✅ NOUVEAU : Note interne admin ────────────────────────────────────────

    public FeedbackDTO addAdminNote(Long id, String note) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback introuvable avec l'id : " + id));
        feedback.setAdminNote(note);
        log.info("Admin note ajoutée sur feedback id={}", id);
        return FeedbackDTO.fromEntity(feedbackRepository.save(feedback));
    }

    // ─── ✅ NOUVEAU : Actions en lot ─────────────────────────────────────────────

    public int bulkApprove(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            try {
                changeStatus(id, FeedbackStatus.APPROVED);
                count++;
            } catch (Exception e) {
                log.warn("Impossible d'approuver feedback id={}: {}", id, e.getMessage());
            }
        }
        log.info("Bulk approve: {} feedbacks approuvés", count);
        return count;
    }

    public int bulkReject(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            try {
                changeStatus(id, FeedbackStatus.REJECTED);
                count++;
            } catch (Exception e) {
                log.warn("Impossible de rejeter feedback id={}: {}", id, e.getMessage());
            }
        }
        log.info("Bulk reject: {} feedbacks rejetés", count);
        return count;
    }

    public int bulkDelete(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            try {
                delete(id);
                count++;
            } catch (Exception e) {
                log.warn("Impossible de supprimer feedback id={}: {}", id, e.getMessage());
            }
        }
        log.info("Bulk delete: {} feedbacks supprimés", count);
        return count;
    }

    // ─── ✅ NOUVEAU : Statistiques globales admin ────────────────────────────────

    public Map<String, Object> getGlobalStats() {
        List<Feedback> all = feedbackRepository.findAll();

        long total = all.size();
        long approved = all.stream().filter(f -> f.getStatus() == FeedbackStatus.APPROVED).count();
        long rejected = all.stream().filter(f -> f.getStatus() == FeedbackStatus.REJECTED).count();
        long pending  = all.stream().filter(f -> f.getStatus() == FeedbackStatus.PENDING).count();

        double avgRating = all.stream()
                .filter(f -> f.getStatus() == FeedbackStatus.APPROVED)
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        // Distribution des notes (1 à 5) sur les approuvés
        Map<Integer, Long> ratingDist = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            final int star = i;
            ratingDist.put(star, all.stream()
                    .filter(f -> f.getStatus() == FeedbackStatus.APPROVED && f.getRating() == star)
                    .count());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("pending", pending);
        stats.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        stats.put("ratingDistribution", ratingDist);
        return stats;
    }

    // ─── Statistiques par article ────────────────────────────────────────────────

    public Double getAverageRating(Long articleId) {
        Double avg = feedbackRepository.findAverageRatingByArticleId(articleId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public long countApproved(Long articleId) {
        return feedbackRepository.countByArticleIdAndStatus(articleId, FeedbackStatus.APPROVED);
    }
}