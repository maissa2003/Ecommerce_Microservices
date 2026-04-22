package tn.esprit.gestionsession.services.implementations;

import tn.esprit.gestionsession.entities.Equipment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.repositories.EquipmentRepository;
import tn.esprit.gestionsession.repositories.SessionEquipmentRepository;
import tn.esprit.gestionsession.services.interfaces.EquipmentInterface;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentInterface {

    @Autowired
    private EquipmentRepository equipmentRepository;
    private SessionEquipmentRepository sessionEquipmentRepository;

    @Override
    public Equipment addEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    @Override
    public List<Equipment> getAllEquipments() {
        return equipmentRepository.findAll();
    }

    @Override
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id).orElse(null);
    }

    @Override
    public Equipment updateEquipment(Long id, Equipment equipment) {
        equipment.setId(id);
        return equipmentRepository.save(equipment);
    }

    @Override
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }


    public List<Equipment> getAvailableEquipments(
            LocalDateTime startAt,
            LocalDateTime endAt
    ) {

        List<Equipment> equipments =
                equipmentRepository.findAll();

        for (Equipment eq : equipments) {

            Integer reserved =
                    sessionEquipmentRepository.sumReservedEquipment(
                            eq.getId(),
                            startAt,
                            endAt
                    );

            int available =
                    eq.getQuantity() - reserved;

            eq.setQuantity(available);
        }

        return equipments;
    }









}
