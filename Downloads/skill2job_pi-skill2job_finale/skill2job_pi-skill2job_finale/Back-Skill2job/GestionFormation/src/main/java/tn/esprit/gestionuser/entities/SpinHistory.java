package tn.esprit.gestionuser.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "spin_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpinHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate spinDate;

    @Column(nullable = false)
    private Integer pointsWon;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (spinDate == null) {
            spinDate = LocalDate.now();
        }
    }
}