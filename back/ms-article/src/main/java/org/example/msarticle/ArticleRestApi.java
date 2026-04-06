package org.example.msarticle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleRestApi {

    @Autowired
    private IArticleService articleService;

    @GetMapping
    public List<ArticleDTO> getAllArticles() {
        return articleService.getAllArticles();
    }

    @GetMapping("/{id}")
    public ArticleDTO getArticleById(@PathVariable Long id) {
        return articleService.getArticleById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArticleDTO createArticle(@RequestBody ArticleDTO dto) {
        return articleService.createArticle(dto);
    }

    @PutMapping("/{id}")
    public ArticleDTO updateArticle(@PathVariable Long id, @RequestBody ArticleDTO dto) {
        return articleService.updateArticle(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
    }

    @GetMapping("/category/{category}")
    public List<ArticleDTO> getByCategory(@PathVariable String category) {
        return articleService.getArticlesByCategory(category);
    }
}