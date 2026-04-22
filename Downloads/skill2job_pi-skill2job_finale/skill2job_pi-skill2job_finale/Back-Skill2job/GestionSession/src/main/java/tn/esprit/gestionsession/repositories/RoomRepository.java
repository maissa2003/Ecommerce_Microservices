package tn.esprit.gestionsession.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionsession.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
