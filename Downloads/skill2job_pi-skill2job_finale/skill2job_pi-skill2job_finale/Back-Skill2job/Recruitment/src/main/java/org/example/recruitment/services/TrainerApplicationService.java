package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.recruitment.Repositories.TrainerApplicationRepository;
import org.example.recruitment.Repositories.TrainerDetailsRepository;
import org.example.recruitment.Repositories.TrainerProfileRepository;
import org.example.recruitment.entities.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TrainerApplicationService {

    private final TrainerApplicationRepository repository;

    // Module 2 repositories
    private final TrainerDetailsRepository detailsRepository;
    private final TrainerProfileRepository profileRepository;

    // =========================
    // MODULE 1: SUBMISSION
    // =========================

    // CREATE
    public TrainerApplication submit(TrainerApplication incoming) {

        return repository.findByUserId(incoming.getUserId())
                .map(existing -> {

                    // Si déjà existe → on met à jour au lieu de bloquer

                    if (incoming.getCvUrl() != null && !incoming.getCvUrl().isBlank()) {
                        existing.setCvUrl(incoming.getCvUrl());
                    }

                    if (incoming.getMotivation() != null && !incoming.getMotivation().isBlank()) {
                        existing.setMotivation(incoming.getMotivation());
                    }

                    // On remet en PENDING (resoumission)
                    existing.setStatus(ApplicationStatus.PENDING);

                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    // Sinon → nouvelle candidature
                    incoming.setStatus(ApplicationStatus.PENDING);
                    return repository.save(incoming);
                });
    }

    // UPDATE (Candidate) - only while PENDING
    public TrainerApplication updateApplication(Long id, TrainerApplication updated) {
        TrainerApplication existing = getById(id);

        if (existing.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("You can edit the application only while status is PENDING.");
        }

        if (updated.getCvUrl() != null && !updated.getCvUrl().isBlank()) {
            existing.setCvUrl(updated.getCvUrl());
        }
        if (updated.getMotivation() != null && !updated.getMotivation().isBlank()) {
            existing.setMotivation(updated.getMotivation());
        }

        return repository.save(existing);
    }

    // READ
    public TrainerApplication getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));
    }

    public TrainerApplication getByUserId(Long userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found for userId: " + userId));
    }

    public List<TrainerApplication> list(ApplicationStatus status) {
        if (status == null) return repository.findAll();
        return repository.findAllByStatus(status);
    }

    // UPDATE (Admin basic status) - kept for debug/testing
    public TrainerApplication updateStatus(Long id, ApplicationStatus status) {
        TrainerApplication app = getById(id);
        app.setStatus(status);
        return repository.save(app);
    }

    // DELETE
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Application not found: " + id);
        }
        repository.deleteById(id);
    }
    // ✅ Nouveau
    public boolean hasApplication(Long userId) {
        return repository.existsByUserId(userId);
    }

    // =========================
    // MODULE 2: ANALYSIS + DECISION + PROFILE
    // =========================

    /**
     * Analyze application (heuristic "AI") and create/update TrainerDetails
     * Endpoint: POST /api/applications/{id}/analyze
     */
    public TrainerDetails analyzeApplication(Long applicationId) {
        TrainerApplication app = getById(applicationId);

        String motivation = app.getMotivation() == null ? "" : app.getMotivation();
        String cvUrl = app.getCvUrl() == null ? "" : app.getCvUrl();

        String text = (motivation + " " + cvUrl).trim();
        String lower = text.toLowerCase();

        // 1) Extract skills (keyword matching)
        List<String> skills = new ArrayList<>();
        addIfContains(skills, lower, "spring", "Spring Boot");
        addIfContains(skills, lower, "java", "Java");
        addIfContains(skills, lower, "angular", "Angular");
        addIfContains(skills, lower, "react", "React");
        addIfContains(skills, lower, "docker", "Docker");
        addIfContains(skills, lower, "kubernetes", "Kubernetes");
        addIfContains(skills, lower, "mysql", "MySQL");
        addIfContains(skills, lower, "postgres", "PostgreSQL");
        addIfContains(skills, lower, "python", "Python");
        addIfContains(skills, lower, "machine learning", "Machine Learning");
        addIfContains(skills, lower, "ml", "Machine Learning");
        addIfContains(skills, lower, "aws", "AWS");
        addIfContains(skills, lower, "azure", "Azure");
        addIfContains(skills, lower, "git", "Git");
        addIfContains(skills, lower, "microservice", "Microservices");
        addIfContains(skills, lower, "microservices", "Microservices");

        if (skills.isEmpty()) skills.add("General");

        // 2) Experience heuristic + level
        int years = guessYears(lower);
        String level = years >= 5 ? "SENIOR" : (years >= 2 ? "MID" : "JUNIOR");

        // 3) Main speciality
        String mainSpeciality = guessMainSpeciality(skills);

        // 4) Professional summary
        String summary = buildSummary(mainSpeciality, level, years, skills, motivation);

        TrainerDetails details = detailsRepository.findByApplication_Id(applicationId)
                .orElse(TrainerDetails.builder()
                        .application(app)
                        .build());

        details.setLevel(level);
        details.setYearsExperience(years);
        details.setSkills(String.join(", ", skills));
        details.setAiSummary(summary);

        return detailsRepository.save(details);
    }

    /**
     * Admin decision: ACCEPT / REJECT
     * If ACCEPT => create TrainerProfile automatically (if not exists)
     * Endpoint: PATCH /api/applications/{id}/decision?decision=ACCEPT
     */
    public TrainerApplication decide(Long applicationId, AdminDecision decision) {
        TrainerApplication app = getById(applicationId);

        if (decision == AdminDecision.REJECT) {
            app.setStatus(ApplicationStatus.REJECTED);
            return repository.save(app);
        }   

        // ACCEPT: ensure details exist (generate if missing)
        TrainerDetails details = detailsRepository.findByApplication_Id(applicationId)
                .orElseGet(() -> analyzeApplication(applicationId));

        // Create profile if not exists
        if (!profileRepository.existsByUserId(app.getUserId())) {
            // derive speciality from skills
            List<String> parsedSkills = parseSkills(details.getSkills());
            String speciality = guessMainSpeciality(parsedSkills);

            TrainerProfile profile = TrainerProfile.builder()
                    .userId(app.getUserId())
                    .level(details.getLevel())
                    .mainSpeciality(speciality)
                    .status(TrainerProfileStatus.ACTIVE)
                    .build();

            profileRepository.save(profile);
        }

        app.setStatus(ApplicationStatus.ACCEPTED);
        return repository.save(app);
    }

    // =========================
    // Helpers (heuristic AI)
    // =========================

    private void addIfContains(List<String> list, String lower, String keyword, String value) {
        if (lower.contains(keyword) && !list.contains(value)) {
            list.add(value);
        }
    }

    private int guessYears(String lower) {
        // Detect patterns like "5 years", "3 ans"
        Pattern p = Pattern.compile("(\\d{1,2})\\s*(years|year|ans|an)");
        Matcher m = p.matcher(lower);
        int best = -1;

        while (m.find()) {
            int y = Integer.parseInt(m.group(1));
            best = Math.max(best, y);
        }
        if (best != -1) return best;

        // Keyword fallback
        if (lower.contains("senior") || lower.contains("lead")) return 6;
        if (lower.contains("mid") || lower.contains("intermediate")) return 3;
        if (lower.contains("junior") || lower.contains("intern") || lower.contains("stage")) return 1;

        // If motivation is long, assume some experience
        return lower.length() > 250 ? 2 : 1;
    }

    private String guessMainSpeciality(List<String> skills) {
        if (skills.contains("Spring Boot") || skills.contains("Java")) return "Backend (Java/Spring)";
        if (skills.contains("Angular") || skills.contains("React")) return "Frontend (SPA)";
        if (skills.contains("Machine Learning") || skills.contains("Python")) return "Data/AI";
        if (skills.contains("Docker") || skills.contains("Kubernetes")) return "DevOps";
        return "General";
    }

    private String buildSummary(String mainSpeciality,
                                String level,
                                int years,
                                List<String> skills,
                                String motivation) {

        String motivationQuality =
                (motivation != null && motivation.length() >= 220) ? "Strong" :
                        (motivation != null && motivation.length() >= 120) ? "Good" :
                                "Basic";

        // Small "confidence" (heuristic) just for UI/pro feel
        int confidence = 60;
        if (skills.size() >= 5) confidence += 15;
        if ("Strong".equals(motivationQuality)) confidence += 10;
        if (years >= 5) confidence += 10;
        if (confidence > 95) confidence = 95;

        StringBuilder report = new StringBuilder();

        report.append("🤖 TRAINER APPLICATION — AI EVALUATION REPORT\n");
        report.append("══════════════════════════════════════════════\n");
        report.append("📌 Confidence (heuristic): ").append(confidence).append("%\n\n");

        // ---------------------------
        // 1. Profile Overview
        // ---------------------------
        report.append("🔎 1) PROFILE OVERVIEW\n");
        report.append("   ▸ Specialization: ").append(mainSpeciality).append("\n");
        report.append("   ▸ Estimated Seniority: ").append(level)
                .append(" (≈ ").append(years).append(" yrs)\n");
        report.append("   ▸ Motivation Strength: ").append(motivationQuality).append("\n");
        report.append("   ▸ Detected Technical Stack: ").append(String.join(", ", skills)).append("\n\n");

        // ---------------------------
        // 2. Strength Assessment
        // ---------------------------
        report.append("💪 2) STRENGTHS\n");

        boolean hasStrength = false;

        if (skills.contains("Spring Boot") || skills.contains("Java")) {
            report.append("   ▸ Solid backend foundation detected (Java/Spring ecosystem).\n");
            hasStrength = true;
        }
        if (skills.contains("Angular") || skills.contains("React")) {
            report.append("   ▸ Frontend SPA exposure identified (Angular/React).\n");
            hasStrength = true;
        }
        if (skills.contains("Docker") || skills.contains("Kubernetes")) {
            report.append("   ▸ DevOps awareness (containerization/orchestration).\n");
            hasStrength = true;
        }
        if (skills.contains("Microservices")) {
            report.append("   ▸ Familiarity with distributed/microservices architecture concepts.\n");
            hasStrength = true;
        }
        if (skills.contains("AWS") || skills.contains("Azure")) {
            report.append("   ▸ Cloud platform exposure detected.\n");
            hasStrength = true;
        }

        if (!hasStrength) {
            report.append("   ▸ General technical profile detected; limited evidence in provided text.\n");
        }

        report.append("\n");

        // ---------------------------
        // 3. Risk & Attention Points
        // ---------------------------
        report.append("⚠️ 3) RISKS & ATTENTION POINTS\n");

        boolean hasRisk = false;

        if (years <= 1) {
            report.append("   ▸ Low experience level — mentoring may be required.\n");
            hasRisk = true;
        }
        if ("Basic".equals(motivationQuality)) {
            report.append("   ▸ Motivation description is brief — verify communication clarity.\n");
            hasRisk = true;
        }
        if (skills.size() > 4) {
            report.append("   ▸ Broad skill range — verify depth vs surface-level exposure.\n");
            hasRisk = true;
        }
        if (years > 5) {
            report.append("   ▸ Senior profile — confirm leadership and teaching capability.\n");
            hasRisk = true;
        }
        if (skills.size() <= 2) {
            report.append("   ▸ Few explicit skills detected — request portfolio / richer CV if possible.\n");
            hasRisk = true;
        }

        if (!hasRisk) {
            report.append("   ▸ No major red flags detected from the provided content.\n");
        }

        report.append("\n");

        // ---------------------------
        // 4. Suggested Interview Focus
        // ---------------------------
        report.append("🎯 4) INTERVIEW FOCUS AREAS\n");

        if (mainSpeciality.startsWith("Backend")) {
            report.append("   ▸ REST API architecture & layering (Controller/Service/DTO).\n");
            report.append("   ▸ Validation + error handling best practices.\n");
            report.append("   ▸ Performance, scalability, and clean code practices.\n");
        } else if (mainSpeciality.startsWith("Frontend")) {
            report.append("   ▸ Angular structure: components/services + RxJS patterns.\n");
            report.append("   ▸ Routing, guards, interceptors.\n");
            report.append("   ▸ UI performance optimization (lists, tables, caching).\n");
        } else if (mainSpeciality.startsWith("DevOps")) {
            report.append("   ▸ Dockerfile design + image/container lifecycle.\n");
            report.append("   ▸ CI/CD deployment workflow.\n");
            report.append("   ▸ Monitoring/logging & production observability.\n");
        } else if (mainSpeciality.startsWith("Data/AI")) {
            report.append("   ▸ Model evaluation metrics and validation strategy.\n");
            report.append("   ▸ Overfitting prevention techniques.\n");
            report.append("   ▸ End-to-end ML pipeline explanation.\n");
        } else {
            report.append("   ▸ Teaching methodology & pedagogy.\n");
            report.append("   ▸ Real project depth (what exactly they built).\n");
            report.append("   ▸ Communication clarity & structuring explanations.\n");
        }

        report.append("\n");
        report.append("──────────────────────────────────────────────\n");

        // ---------------------------
        // 5. Final Recommendation
        // ---------------------------
        report.append("✅ 5) FINAL RECOMMENDATION\n");

        String recommendation =
                level.equals("SENIOR") ?
                        "Highly recommended. Strong potential trainer. Consider accelerated onboarding." :
                        level.equals("MID") ?
                                "Recommended. Proceed with technical + pedagogical interview." :
                                "Conditionally recommended. Suitable for junior track with supervision.";

        // Add color-like indicator using emoji
        if (level.equals("SENIOR")) {
            report.append("🟢 ").append(recommendation);
        } else if (level.equals("MID")) {
            report.append("🟡 ").append(recommendation);
        } else {
            report.append("🟠 ").append(recommendation);
        }

        return report.toString();
    }


    private List<String> parseSkills(String skillsCsv) {
        if (skillsCsv == null || skillsCsv.isBlank()) return List.of();
        String[] parts = skillsCsv.split(",");
        List<String> out = new ArrayList<>();
        for (String p : parts) {
            String s = p.trim();
            if (!s.isEmpty()) out.add(s);
        }
        return out;
    }
}
