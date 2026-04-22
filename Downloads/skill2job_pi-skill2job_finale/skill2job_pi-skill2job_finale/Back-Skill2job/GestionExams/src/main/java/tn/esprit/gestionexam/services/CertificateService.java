package tn.esprit.gestionexam.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Certificate;
import tn.esprit.gestionexam.entities.Evaluation;
import tn.esprit.gestionexam.repositories.CertificateRepository;
import tn.esprit.gestionexam.repositories.EvaluationRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;

    // Create
    public Certificate createCertificate(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        // Check if user passed the exam
        if (!evaluation.getPassed()) {
            throw new RuntimeException("Cannot generate certificate: User did not pass the exam (Score: "
                    + evaluation.getScore() + ", Required: " + evaluation.getExam().getPassScore() + ")");
        }

        // Check if certificate already exists
        Certificate existingCert = certificateRepository.findByEvaluation(evaluation);
        if (existingCert != null) {
            throw new RuntimeException("Certificate already exists for this evaluation with code: "
                    + existingCert.getCertificateCode());
        }

        Certificate certificate = new Certificate();
        certificate.setEvaluation(evaluation);
        certificate.setIssueDate(LocalDate.now());
        certificate.setCertificateCode(generateCertificateCode(evaluation));

        return certificateRepository.save(certificate);
    }

    // Read all
    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    // Read by ID
    public Certificate getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found with id: " + id));
    }

    // Read by Evaluation
    public Certificate getCertificateByEvaluationId(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));
        Certificate certificate = certificateRepository.findByEvaluation(evaluation);
        if (certificate == null) {
            throw new RuntimeException("No certificate found for evaluation id: " + evaluationId);
        }
        return certificate;
    }

    // Read by User
    public List<Certificate> getCertificatesByUserId(Long userId) {
        return certificateRepository.findByEvaluationUserId(userId);
    }

    // Read by User and Exam
    public Certificate getCertificateByUserAndExam(Long userId, Long examId) {
        List<Certificate> userCertificates = certificateRepository.findByEvaluationUserId(userId);
        return userCertificates.stream()
                .filter(cert -> cert.getEvaluation().getExam().getId().equals(examId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No certificate found for user " + userId + " and exam " + examId));
    }

    // Update certificate (usually only date can be updated, code should remain unique)
    public Certificate updateCertificate(Long id, Certificate certificateDetails) {
        Certificate existingCertificate = getCertificateById(id);

        // Only allow updating issue date, keep code unique
        if (certificateDetails.getIssueDate() != null) {
            existingCertificate.setIssueDate(certificateDetails.getIssueDate());
        }

        return certificateRepository.save(existingCertificate);
    }

    // Delete
    public void deleteCertificate(Long id) {
        Certificate certificate = getCertificateById(id);
        certificateRepository.delete(certificate);
    }

    // Delete by Evaluation
    public void deleteCertificateByEvaluationId(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        Certificate certificate = certificateRepository.findByEvaluation(evaluation);
        if (certificate != null) {
            certificateRepository.delete(certificate);
        }
    }

    // Verify certificate validity
    public boolean verifyCertificate(String certificateCode) {
        return certificateRepository.findByCertificateCode(certificateCode) != null;
    }

    // Get certificate details by code
    public Certificate getCertificateByCode(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode);
        if (certificate == null) {
            throw new RuntimeException("Certificate not found with code: " + certificateCode);
        }
        return certificate;
    }

    // Count certificates by user
    public long countCertificatesByUser(Long userId) {
        return certificateRepository.findByEvaluationUserId(userId).size();
    }

    // Generate unique certificate code
    private String generateCertificateCode(Evaluation evaluation) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String examPart = evaluation.getExam().getId().toString();
        String userPart = evaluation.getUserId().toString();
        String uniquePart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        return String.format("CERT-%s-%s-%s-%s", examPart, userPart, datePart, uniquePart);
    }

    // Bulk create certificates for all passed evaluations of an exam
    public List<Certificate> createCertificatesForExam(Long examId) {
        List<Evaluation> passedEvaluations = evaluationRepository.findByExamIdAndPassed(examId, true);

        return passedEvaluations.stream()
                .filter(eval -> certificateRepository.findByEvaluation(eval) == null)
                .map(eval -> {
                    Certificate cert = new Certificate();
                    cert.setEvaluation(eval);
                    cert.setIssueDate(LocalDate.now());
                    cert.setCertificateCode(generateCertificateCode(eval));
                    return certificateRepository.save(cert);
                })
                .toList();
    }
}