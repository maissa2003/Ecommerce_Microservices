package tn.esprit.ms_feedback.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.ms_feedback.entities.FeedbackDTO;
import tn.esprit.ms_feedback.services.FeedbackService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // ─── CRUD ───────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<FeedbackDTO>> getAll() {
        return ResponseEntity.ok(feedbackService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getById(id));
    }

    @PostMapping
    public ResponseEntity<FeedbackDTO> create(@Valid @RequestBody FeedbackDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDTO> update(@PathVariable Long id,
                                               @Valid @RequestBody FeedbackDTO dto) {
        return ResponseEntity.ok(feedbackService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        feedbackService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Par article ────────────────────────────────────────────────────────────

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<FeedbackDTO>> getByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(feedbackService.getByArticle(articleId));
    }

    @GetMapping("/article/{articleId}/approved")
    public ResponseEntity<List<FeedbackDTO>> getApprovedByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(feedbackService.getApprovedByArticle(articleId));
    }

    // ─── Par utilisateur ────────────────────────────────────────────────────────

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(feedbackService.getByUser(userId));
    }

    // ─── Modération ─────────────────────────────────────────────────────────────

    @GetMapping("/pending")
    public ResponseEntity<List<FeedbackDTO>> getPending() {
        return ResponseEntity.ok(feedbackService.getPending());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<FeedbackDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<FeedbackDTO> reject(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.reject(id));
    }

    // ─── Statistiques ───────────────────────────────────────────────────────────

    @GetMapping("/article/{articleId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long articleId) {
        return ResponseEntity.ok(Map.of(
                "articleId", articleId,
                "averageRating", feedbackService.getAverageRating(articleId),
                "totalApproved", feedbackService.countApproved(articleId)
        ));
    }
}
