package tn.esprit.ms_order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.ms_order.entities.Country;
import tn.esprit.ms_order.services.CountryService;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService countryService;

    @GetMapping
    public ResponseEntity<List<Country>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Country>> getActiveCountries() {
        return ResponseEntity.ok(countryService.getActiveCountries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Country> getCountryById(@PathVariable Long id) {
        return ResponseEntity.ok(countryService.getCountryById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Country> getCountryByCode(@PathVariable String code) {
        return ResponseEntity.ok(countryService.getCountryByCode(code));
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Country>> getCountriesByRegion(@PathVariable String region) {
        return ResponseEntity.ok(countryService.getCountriesByRegion(region));
    }

    @PostMapping
    public ResponseEntity<Country> createCountry(@RequestBody Country country) {
        return ResponseEntity.ok(countryService.saveCountry(country));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Country> updateCountry(@PathVariable Long id, @RequestBody Country country) {
        country.setId(id);
        return ResponseEntity.ok(countryService.saveCountry(country));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Country> toggleCountryStatus(@PathVariable Long id) {
        return ResponseEntity.ok(countryService.toggleCountryStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCountry(@PathVariable Long id) {
        countryService.deleteCountry(id);
        return ResponseEntity.noContent().build();
    }
}
