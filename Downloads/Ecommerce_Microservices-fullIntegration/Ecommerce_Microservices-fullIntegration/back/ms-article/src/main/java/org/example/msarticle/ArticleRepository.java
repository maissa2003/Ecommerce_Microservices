package org.example.msarticle;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByCategory(String category);
    List<Article> findByCategoryId(Long categoryId); // ← AJOUT
}