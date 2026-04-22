package tn.esprit.gestionsession.services.implementations;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.entities.Room;
import tn.esprit.gestionsession.repositories.RoomRepository;
import tn.esprit.gestionsession.services.interfaces.RoomInterface;

import java.util.List;

@Service
public class RoomServiceImpl implements RoomInterface {
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public List<Room> getRooms() {
        return roomRepository.findAll();
    }
}
