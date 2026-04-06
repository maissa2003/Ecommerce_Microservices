package tn.esprit.ms_order.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.ms_order.entities.PromoCode;

import java.util.Optional;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCode(String code);
}
