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

    @NotNull(message = "L'ID de l'article est obligatoire")
    private Long articleId;

    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long userId;

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(min = 5, max = 1000)
    private String comment;

    @Min(1) @Max(5)
    private int rating;

    private FeedbackStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Conversion Entity -> DTO
    public static FeedbackDTO fromEntity(Feedback feedback) {
        return FeedbackDTO.builder()
                .id(feedback.getId())
                .articleId(feedback.getArticleId())
                .userId(feedback.getUserId())
                .comment(feedback.getComment())
                .rating(feedback.getRating())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }

    // Conversion DTO -> Entity
    public Feedback toEntity() {
        return Feedback.builder()
                .articleId(this.articleId)
                .userId(this.userId)
                .comment(this.comment)
                .rating(this.rating)
                .build();
    }
}
