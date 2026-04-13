package tn.esprit.ms_feedback.entities;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {

    private Long id;

    @NotNull(message = "L'articleId est obligatoire")
    private Long articleId;

    @NotNull(message = "L'userId est obligatoire")
    private Long userId;

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(min = 5, max = 1000)
    private String comment;

    @Min(1) @Max(5)
    private int rating;

    private String status;

    // ✅ NOUVEAU
    private String adminNote;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ─── Mapping ────────────────────────────────────────────────────────────────

    public static FeedbackDTO fromEntity(Feedback f) {
        return FeedbackDTO.builder()
                .id(f.getId())
                .articleId(f.getArticleId())
                .userId(f.getUserId())
                .comment(f.getComment())
                .rating(f.getRating())
                .status(f.getStatus() != null ? f.getStatus().name() : null)
                .adminNote(f.getAdminNote())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }

    public Feedback toEntity() {
        return Feedback.builder()
                .articleId(this.articleId)
                .userId(this.userId)
                .comment(this.comment)
                .rating(this.rating)
                .adminNote(this.adminNote)
                .build();
    }
}