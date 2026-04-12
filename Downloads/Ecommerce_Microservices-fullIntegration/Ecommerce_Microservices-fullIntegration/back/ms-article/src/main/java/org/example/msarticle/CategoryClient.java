package org.example.msarticle;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-category") // nom exact dans application.properties
public interface CategoryClient {

    @GetMapping("/api/categories/{id}")
    CategoryResponse getCategoryById(@PathVariable("id") Long id);

    @GetMapping("/api/categories/{id}/exists")
    boolean categoryExists(@PathVariable("id") Long id);
}