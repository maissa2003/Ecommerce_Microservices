package org.example.msarticle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    private Long id;
    private String name;
    private Double price;
    private String description;
    private String category;      // nom catégorie (affiché au front)
    private Long categoryId;      // ← AJOUT : ID vers MS-Category
    private String categoryName;  // ← AJOUT : enrichi via Feign
    private String image;
    private Integer stock;
    private String brand;
    private Double rating;
    private Integer reviews;
}