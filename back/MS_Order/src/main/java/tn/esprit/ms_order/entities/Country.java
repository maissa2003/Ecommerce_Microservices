package tn.esprit.ms_order.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "countries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String flag;

    @Column(nullable = false)  // removed unique = true
    private String isoCode;

    private String region;

    private Boolean active = true;

    public Country(String code, String name, String flag, String isoCode, String region) {
        this.code = code;
        this.name = name;
        this.flag = flag;
        this.isoCode = isoCode;
        this.region = region;
        this.active = true;
    }
}