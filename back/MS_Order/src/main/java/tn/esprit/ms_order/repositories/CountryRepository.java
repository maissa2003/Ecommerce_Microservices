package tn.esprit.ms_order.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.ms_order.entities.Country;

import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByCode(String code);

    Optional<Country> findByIsoCode(String isoCode);

    List<Country> findByActiveTrue();

    List<Country> findByRegion(String region);

    boolean existsByCode(String code);

    boolean existsByIsoCode(String isoCode);
}
