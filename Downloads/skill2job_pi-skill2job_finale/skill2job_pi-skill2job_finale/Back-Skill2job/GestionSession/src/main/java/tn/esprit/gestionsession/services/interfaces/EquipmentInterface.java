package tn.esprit.gestionsession.services.interfaces;

import tn.esprit.gestionsession.entities.Equipment;

import java.time.LocalDateTime;
import java.util.List;

public interface EquipmentInterface {

    Equipment addEquipment(Equipment equipment);

    List<Equipment> getAllEquipments();

    Equipment getEquipmentById(Long id);

    Equipment updateEquipment(Long id, Equipment equipment);

    void deleteEquipment(Long id);
    public List<Equipment> getAvailableEquipments(
            LocalDateTime startAt,
            LocalDateTime endAt
    );
}
