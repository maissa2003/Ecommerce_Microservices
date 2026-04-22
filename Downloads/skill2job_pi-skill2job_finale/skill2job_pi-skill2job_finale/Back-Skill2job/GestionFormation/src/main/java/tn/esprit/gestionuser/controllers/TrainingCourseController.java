package tn.esprit.gestionuser.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.gestionuser.entities.Category;
import tn.esprit.gestionuser.entities.TrainingCourse;
import tn.esprit.gestionuser.repositories.CategoryRepository;
import tn.esprit.gestionuser.repositories.TrainingCourseRepository;

@RestController
@RequestMapping("/api/training-courses")
public class TrainingCourseController {

    private final TrainingCourseRepository courseRepo;
    private final CategoryRepository categoryRepo;
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public TrainingCourseController(TrainingCourseRepository courseRepo, CategoryRepository categoryRepo) {
        this.courseRepo = courseRepo;
        this.categoryRepo = categoryRepo;
    }

    @GetMapping
    public List<TrainingCourse> getAllCourses() {
        return courseRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingCourse> getCourse(@PathVariable Long id) {
        return courseRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NOUVEAU : cours d'un trainer spécifique
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<TrainingCourse>> getCoursesByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(courseRepo.findByTrainerId(trainerId));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TrainingCourse> createCourse(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) Integer pointsPrice,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Long trainerId,        // ✅ NOUVEAU
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile[] pdfs) {
        try {
            if (price == null || price < 0) {
                return ResponseEntity.badRequest().build();
            }

            if (currency == null || currency.trim().isEmpty()) {
                currency = "USD";
            }

            Category category;
            if (categoryId != null) {
                category = categoryRepo.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            } else if (categoryName != null && !categoryName.trim().isEmpty()) {
                category = categoryRepo.findByName(categoryName)
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(categoryName);
                            return categoryRepo.save(newCategory);
                        });
            } else {
                return ResponseEntity.badRequest().build();
            }

            TrainingCourse course = new TrainingCourse();
            course.setTitle(title);
            course.setDescription(description);
            course.setPrice(price);
            course.setCurrency(currency.toUpperCase());
            course.setPointsPrice(pointsPrice);
            course.setCategory(category);
            course.setTrainerId(trainerId);                        // ✅ NOUVEAU
            course.setCreatedAt(LocalDateTime.now());
            course.setUpdatedAt(LocalDateTime.now());

            if (image != null && !image.isEmpty()) {
                course.setImageUrl(saveFile(image));
            }

            List<String> pdfUrls = new ArrayList<>();
            if (pdfs != null && pdfs.length > 0) {
                for (MultipartFile pdf : pdfs) {
                    if (pdf != null && !pdf.isEmpty()) {
                        pdfUrls.add(saveFile(pdf));
                    }
                }
            }
            course.setPdfUrls(pdfUrls);

            TrainingCourse savedCourse = courseRepo.save(course);
            return ResponseEntity.ok(savedCourse);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<TrainingCourse> updateCourse(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) Integer pointsPrice,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Long trainerId,        // ✅ NOUVEAU
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile[] pdfs,
            @RequestParam(required = false) String existingPdfs) {

        try {
            TrainingCourse course = courseRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

            if (price == null || price < 0) {
                return ResponseEntity.badRequest().build();
            }

            course.setTitle(title);
            course.setDescription(description);
            course.setPrice(price);
            course.setCurrency(currency != null && !currency.trim().isEmpty()
                    ? currency.toUpperCase() : "USD");
            course.setPointsPrice(pointsPrice);
            course.setTrainerId(trainerId);                        // ✅ NOUVEAU

            if (categoryId != null) {
                Category category = categoryRepo.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                course.setCategory(category);
            } else if (categoryName != null && !categoryName.trim().isEmpty()) {
                Category category = categoryRepo.findByName(categoryName)
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(categoryName);
                            return categoryRepo.save(newCategory);
                        });
                course.setCategory(category);
            }

            if (image != null && !image.isEmpty()) {
                course.setImageUrl(saveFile(image));
            }

            List<String> finalPdfUrls = new ArrayList<>();

            if (existingPdfs != null && !existingPdfs.trim().isEmpty()) {
                String[] existing = existingPdfs
                        .replace("[", "").replace("]", "")
                        .replace("\"", "").split(",");
                for (String url : existing) {
                    if (url != null && !url.trim().isEmpty()) {
                        finalPdfUrls.add(url.trim());
                    }
                }
            }

            if (pdfs != null && pdfs.length > 0) {
                for (MultipartFile pdf : pdfs) {
                    if (pdf != null && !pdf.isEmpty()) {
                        finalPdfUrls.add(saveFile(pdf));
                    }
                }
            }

            course.setPdfUrls(finalPdfUrls);
            course.setUpdatedAt(LocalDateTime.now());

            TrainingCourse savedCourse = courseRepo.save(course);
            return ResponseEntity.ok(savedCourse);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            TrainingCourse course = courseRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
            courseRepo.delete(course);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());
        return "/uploads/" + filename;
    }
}