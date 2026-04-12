package org.example.msarticle;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private Long categoryId;   // ← AJOUT
    private String image;
    private Integer stock;
    private String brand;
    private Double rating;
    private Integer reviews;
}