package tn.esprit.gestionsession.controllers;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.gestionsession.entities.Equipment;
import tn.esprit.gestionsession.entities.SessionEquipment;
import tn.esprit.gestionsession.services.interfaces.EquipmentInterface;
import tn.esprit.gestionsession.repositories.SessionEquipmentRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/equipments")
public class EquipmentController {

    @Autowired
    private EquipmentInterface equipmentService;
    @Autowired
    private SessionEquipmentRepository sessionEquipmentRepository;

    @PostMapping("/add")
    public Equipment add(@RequestBody Equipment equipment) {
        return equipmentService.addEquipment(equipment);
    }

    @GetMapping("/all")
    public List<Equipment> getAll() {
        return equipmentService.getAllEquipments();
    }

    @GetMapping("/{id}")
    public Equipment getById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
    }

    @PutMapping("/update/{id}")
    public Equipment update(@PathVariable Long id, @RequestBody Equipment equipment) {
        return equipmentService.updateEquipment(id, equipment);
    }
    @PostMapping("/add-with-photo")
    public Equipment addWithPhoto(
            @RequestParam("name") String name,
            @RequestParam("quantity") int quantity,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path uploadPath = Paths.get("uploads/equipments/");
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Equipment equipment = new Equipment();
        equipment.setName(name);
        equipment.setQuantity(quantity);
        equipment.setPhoto(fileName);

        return equipmentService.addEquipment(equipment);
    }
    @GetMapping("/photo/{filename}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) throws Exception {

        Path path = Paths.get("uploads/equipments/").resolve(filename);

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            // Avoid returning 400; return 404 so clients can fallback safely
            return ResponseEntity.notFound().build();
        }

        // Detect file type automatically
        String contentType = Files.probeContentType(path);

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(resource);
    }


    @PutMapping("/update-with-photo/{id}")
    public Equipment updateWithPhoto(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("quantity") int quantity,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws Exception {

        Equipment equipment = equipmentService.getEquipmentById(id);

        equipment.setName(name);
        equipment.setQuantity(quantity);

        // if new photo selected
        if (file != null && !file.isEmpty()) {

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get("uploads/equipments/");
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            equipment.setPhoto(fileName);
        }

        return equipmentService.updateEquipment(id, equipment);
    }

    @GetMapping("/available")
    public List<Equipment> getAvailableEquipments(

            @RequestParam LocalDateTime startAt,

            @RequestParam LocalDateTime endAt

    ) {

        return equipmentService.getAvailableEquipments(startAt, endAt);

    }
    @GetMapping("/{id}/reservations")
    public List<SessionEquipment> getEquipmentReservations(@PathVariable Long id) {

        return sessionEquipmentRepository.findByEquipmentIdWithSession(id);

    }




}
