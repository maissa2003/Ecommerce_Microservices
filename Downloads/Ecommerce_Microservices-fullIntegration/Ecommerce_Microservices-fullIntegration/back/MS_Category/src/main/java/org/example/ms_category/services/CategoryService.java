package org.example.ms_category.services;

import lombok.RequiredArgsConstructor;
import org.example.ms_category.entities.Category;
import org.example.ms_category.repositories.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public List<Category> getAll() {
        return repository.findAll();
    }

    public Category getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
    }

    public boolean existsById(Long id) {
        return repository.existsById(id); // ← AJOUT
    }

    public Category save(Category category) {
        return repository.save(category);
    }

    public Category update(Long id, Category category) {
        Category existing = getById(id);
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}