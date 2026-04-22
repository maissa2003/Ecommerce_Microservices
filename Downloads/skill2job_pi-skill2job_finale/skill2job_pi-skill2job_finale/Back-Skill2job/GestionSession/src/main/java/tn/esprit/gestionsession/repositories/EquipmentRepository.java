package tn.esprit.gestionsession.repositories;

import tn.esprit.gestionsession.entities.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}
