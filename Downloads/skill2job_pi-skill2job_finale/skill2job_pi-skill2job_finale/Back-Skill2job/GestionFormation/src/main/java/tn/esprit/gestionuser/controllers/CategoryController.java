package tn.esprit.gestionuser.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionuser.entities.Category;
import tn.esprit.gestionuser.repositories.CategoryRepository;
import tn.esprit.gestionuser.repositories.TrainingCourseRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryRepository categoryRepo;
    private final TrainingCourseRepository courseRepo;

    public CategoryController(CategoryRepository categoryRepo, TrainingCourseRepository courseRepo) {
        this.categoryRepo = categoryRepo;
        this.courseRepo = courseRepo;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        return categoryRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NOUVELLE MÉTHODE : Récupérer les cours d'une catégorie
    @GetMapping("/{id}/courses")
    public ResponseEntity<?> getCategoryCourses(@PathVariable Long id) {
        return categoryRepo.findById(id).map(category -> {
            List<?> courses = courseRepo.findByCategoryId(id);
            return ResponseEntity.ok(courses);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            if (category.getName() == null || category.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category name is required");
            }

            if (categoryRepo.findByName(category.getName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Category with name '" + category.getName() + "' already exists");
            }

            Category savedCategory = categoryRepo.save(category);
            return ResponseEntity.ok(savedCategory);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create category: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category updatedCategory) {
        return categoryRepo.findById(id).map(category -> {
            try {
                if (updatedCategory.getName() == null || updatedCategory.getName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Category name is required");
                }

                category.setName(updatedCategory.getName());
                category.setDescription(updatedCategory.getDescription());
                Category savedCategory = categoryRepo.save(category);
                return ResponseEntity.ok(savedCategory);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to update category: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepo.findById(id).map(category -> {
            try {
                categoryRepo.delete(category);
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete category: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}