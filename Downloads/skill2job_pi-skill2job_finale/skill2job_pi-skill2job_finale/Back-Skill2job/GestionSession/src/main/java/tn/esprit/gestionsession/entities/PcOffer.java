package tn.esprit.gestionsession.entities;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PcOffer {

    private String name;
    private String cpu;
    private String gpu;
    private Integer ram;
    private Double price;
    private String website;

    public PcOffer(String name, String cpu, String gpu,
                   Integer ram, Double price, String website) {
        this.name = name;
        this.cpu = cpu;
        this.gpu = gpu;
        this.ram = ram;
        this.price = price;
        this.website = website;
    }


}