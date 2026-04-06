package org.example.msarticle;

import java.util.List;

public interface IArticleService {

    List<ArticleDTO> getAllArticles();

    ArticleDTO getArticleById(Long id);

    ArticleDTO createArticle(ArticleDTO dto);

    ArticleDTO updateArticle(Long id, ArticleDTO dto);

    void deleteArticle(Long id);

    List<ArticleDTO> getArticlesByCategory(String category);
}