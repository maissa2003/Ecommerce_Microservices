package tn.esprit.ms_order.services;

import org.springframework.stereotype.Service;
import tn.esprit.ms_order.entities.PromoCode;
import tn.esprit.ms_order.repositories.PromoCodeRepository;

import java.util.List;

@Service
public class PromoCodeService {

    private final PromoCodeRepository repository;

    public PromoCodeService(PromoCodeRepository repository) {
        this.repository = repository;
    }

    public PromoCode save(PromoCode promoCode) {
        return repository.save(promoCode);
    }

    public List<PromoCode> findAll() {
        return repository.findAll();
    }

    public PromoCode toggleActive(Long id) {
        PromoCode code = repository.findById(id).orElseThrow(() -> new RuntimeException("Code not found"));
        code.setActive(!code.getActive());
        return repository.save(code);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
