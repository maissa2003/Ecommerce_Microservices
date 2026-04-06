package org.example.msarticle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService implements IArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    private ArticleDTO toDTO(Article a) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(a.getId());
        dto.setName(a.getName());
        dto.setPrice(a.getPrice());
        dto.setDescription(a.getDescription());
        dto.setCategory(a.getCategory());
        dto.setImage(a.getImage());
        dto.setStock(a.getStock());
        dto.setBrand(a.getBrand());
        dto.setRating(a.getRating());
        dto.setReviews(a.getReviews());
        return dto;
    }

    private Article toEntity(ArticleDTO dto) {
        Article a = new Article();
        a.setName(dto.getName());
        a.setPrice(dto.getPrice());
        a.setDescription(dto.getDescription());
        a.setCategory(dto.getCategory());
        a.setImage(dto.getImage());
        a.setStock(dto.getStock() != null ? dto.getStock() : 0);
        a.setBrand(dto.getBrand());
        a.setRating(dto.getRating() != null ? dto.getRating() : 0.0);
        a.setReviews(dto.getReviews() != null ? dto.getReviews() : 0);
        return a;
    }

    @Override
    public List<ArticleDTO> getAllArticles() {
        return articleRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public ArticleDTO getArticleById(Long id) {
        Article a = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable: " + id));
        return toDTO(a);
    }

    @Override
    public ArticleDTO createArticle(ArticleDTO dto) {
        return toDTO(articleRepository.save(toEntity(dto)));
    }

    @Override
    public ArticleDTO updateArticle(Long id, ArticleDTO dto) {
        Article a = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable: " + id));
        a.setName(dto.getName());
        a.setPrice(dto.getPrice());
        a.setDescription(dto.getDescription());
        a.setCategory(dto.getCategory());
        a.setImage(dto.getImage());
        a.setStock(dto.getStock());
        a.setBrand(dto.getBrand());
        a.setRating(dto.getRating());
        a.setReviews(dto.getReviews());
        return toDTO(articleRepository.save(a));
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
                .stream().map(this::toDTO).collect(Collectors.toList());
    }
}