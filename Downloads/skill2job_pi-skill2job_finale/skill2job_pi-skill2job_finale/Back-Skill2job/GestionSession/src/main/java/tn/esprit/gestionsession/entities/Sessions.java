package tn.esprit.gestionsession.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sessions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private SessionType type;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Integer capacity;

    @Column(name = "trainer_id")
    private Long trainerId;
    
    @Column(name = "formation_id")
    private Long formationId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "session_participants",
            joinColumns = @JoinColumn(name = "session_id")
    )
    @Column(name = "user_id")
    private Set<Long> participantIds = new HashSet<>();

    // ✅ REMOVED @JsonIgnore — room must be serialized so Angular gets roomCode
    // ✅ ADDED @JsonIgnoreProperties to prevent circular reference (room -> session -> room -> ...)
    @OneToOne
    @JoinColumn(name = "room_id")
    @JsonIgnoreProperties("session")
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @OneToMany(
            mappedBy = "session",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SessionEquipment> sessionEquipments;
}