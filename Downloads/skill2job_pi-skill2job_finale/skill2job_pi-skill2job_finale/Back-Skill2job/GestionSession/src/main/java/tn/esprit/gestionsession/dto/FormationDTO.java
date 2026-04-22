package tn.esprit.gestionsession.dto;

import lombok.Data;

@Data
public class FormationDTO {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Double price;
    private String currency;
}