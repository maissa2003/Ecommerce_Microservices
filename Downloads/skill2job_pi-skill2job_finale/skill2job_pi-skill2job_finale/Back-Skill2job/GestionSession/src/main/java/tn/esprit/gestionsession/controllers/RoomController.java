package tn.esprit.gestionsession.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.gestionsession.entities.Room;
import tn.esprit.gestionsession.services.interfaces.RoomInterface;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomInterface roomService;

    @GetMapping("/all")
    public List<Room> getAll() {
        return roomService.getRooms();
    }
}
