package org.example.msarticle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService implements IArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoryClient categoryClient; // ← AJOUT

    // ── DTO → Entity ──────────────────────────────────────────────────
    private Article toEntity(ArticleDTO dto) {
        Article a = new Article();
        a.setName(dto.getName());
        a.setPrice(dto.getPrice());
        a.setDescription(dto.getDescription());
        a.setCategory(dto.getCategory() != null ? dto.getCategory() : "");
        a.setCategoryId(dto.getCategoryId());  // ← AJOUT
        a.setImage(dto.getImage());
        a.setStock(dto.getStock() != null ? dto.getStock() : 0);
        a.setBrand(dto.getBrand());
        a.setRating(dto.getRating() != null ? dto.getRating() : 0.0);
        a.setReviews(dto.getReviews() != null ? dto.getReviews() : 0);
        return a;
    }

    // ── Entity → DTO simple ───────────────────────────────────────────
    private ArticleDTO toDTO(Article a) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(a.getId());
        dto.setName(a.getName());
        dto.setPrice(a.getPrice());
        dto.setDescription(a.getDescription());
        dto.setCategory(a.getCategory());
        dto.setCategoryId(a.getCategoryId());  // ← AJOUT
        dto.setImage(a.getImage());
        dto.setStock(a.getStock());
        dto.setBrand(a.getBrand());
        dto.setRating(a.getRating());
        dto.setReviews(a.getReviews());
        return dto;
    }

    // ── Entity → DTO enrichi avec nom catégorie via Feign ────────────
    private ArticleDTO toDTOWithCategory(Article a) {
        ArticleDTO dto = toDTO(a);
        if (a.getCategoryId() != null) {
            try {
                CategoryResponse cat = categoryClient.getCategoryById(a.getCategoryId());
                dto.setCategoryName(cat.getName());
                dto.setCategory(cat.getName());
            } catch (Exception e) {
                // MS-Category indisponible → on garde la valeur existante
                dto.setCategoryName(a.getCategory());
            }
        }
        return dto;
    }

    // ── CRUD ──────────────────────────────────────────────────────────

    @Override
    public List<ArticleDTO> getAllArticles() {
        return articleRepository.findAll()
                .stream()
                .map(this::toDTOWithCategory)
                .collect(Collectors.toList());
    }

    @Override
    public ArticleDTO getArticleById(Long id) {
        Article a = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable: " + id));
        return toDTOWithCategory(a);
    }

    @Override
    public ArticleDTO createArticle(ArticleDTO dto) {
        // 1. categoryId obligatoire
        if (dto.getCategoryId() == null) {
            throw new RuntimeException("categoryId est obligatoire");
        }

        // 2. Vérifier que la catégorie existe via Feign
        boolean exists = categoryClient.categoryExists(dto.getCategoryId());
        if (!exists) {
            throw new RuntimeException(
                "Catégorie ID " + dto.getCategoryId() + " introuvable dans MS-Category"
            );
        }

        // 3. Récupérer le nom officiel de la catégorie
        CategoryResponse cat = categoryClient.getCategoryById(dto.getCategoryId());
        dto.setCategory(cat.getName());

        // 4. Sauvegarder et retourner
        return toDTOWithCategory(articleRepository.save(toEntity(dto)));
    }

    @Override
    public ArticleDTO updateArticle(Long id, ArticleDTO dto) {
        Article a = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable: " + id));

        // Valider la nouvelle catégorie si changée
        if (dto.getCategoryId() != null) {
            boolean exists = categoryClient.categoryExists(dto.getCategoryId());
            if (!exists) {
                throw new RuntimeException(
                    "Catégorie ID " + dto.getCategoryId() + " introuvable"
                );
            }
            CategoryResponse cat = categoryClient.getCategoryById(dto.getCategoryId());
            dto.setCategory(cat.getName());
        }

        a.setName(dto.getName());
        a.setPrice(dto.getPrice());
        a.setDescription(dto.getDescription());
        a.setCategory(dto.getCategory());
        a.setCategoryId(dto.getCategoryId()); // ← AJOUT
        a.setImage(dto.getImage());
        a.setStock(dto.getStock());
        a.setBrand(dto.getBrand());
        a.setRating(dto.getRating());
        a.setReviews(dto.getReviews());

        return toDTOWithCategory(articleRepository.save(a));
    }

    @Override
    public void deleteArticle(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new RuntimeException("Article introuvable: " + id);
        }
        articleRepository.deleteById(id);
    }

    @Override
    public List<ArticleDTO> getArticlesByCategory(String category) {
        return articleRepository.findByCategory(category)
                .stream()
                .map(this::toDTOWithCategory)
                .collect(Collectors.toList());
    }

    public List<ArticleDTO> getArticlesByCategoryId(Long categoryId) {
        return articleRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::toDTOWithCategory)
                .collect(Collectors.toList());
    }
}