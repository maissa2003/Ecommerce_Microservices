package tn.esprit.gestionsession.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String roomCode;

    private String meetingLink;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    // ✅ Prevents circular: Room -> Session -> Room -> Session -> ...
    @OneToOne(mappedBy = "room")
    @JsonIgnoreProperties("room")
    private Sessions session;
}




















