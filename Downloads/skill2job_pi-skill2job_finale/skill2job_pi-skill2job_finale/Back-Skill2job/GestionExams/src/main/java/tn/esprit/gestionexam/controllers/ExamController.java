package tn.esprit.gestionexam.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionexam.dto.SubmitExamRequest;
import tn.esprit.gestionexam.dto.SubmitExamResponse;
import tn.esprit.gestionexam.entities.*;
import tn.esprit.gestionexam.services.CertificateService;
import tn.esprit.gestionexam.services.EvaluationService;
import tn.esprit.gestionexam.services.ExamService;
import tn.esprit.gestionexam.services.QuestionService;
import tn.esprit.gestionexam.repositories.ViolationRepository;
import tn.esprit.gestionexam.repositories.UserAnswerRepository;

import java.util.List;

@RestController
@RequestMapping("/api/exams")

public class ExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private UserAnswerRepository userAnswerRepository;

    // ==================== EXAM ENDPOINTS ====================

    @PostMapping("/exams")
    public Examen createExam(@RequestBody Examen exam) {
        return examService.createExam(exam);
    }

    @GetMapping("/exams")
    public List<Examen> getAllExams() {
        return examService.getAllExams();
    }

    @GetMapping("/exams/{id}")
    public Examen getExamById(@PathVariable Long id) {
        return examService.getExamById(id);
    }

    @PutMapping("/exams/{id}")
    public Examen updateExam(@PathVariable Long id, @RequestBody Examen exam) {
        return examService.updateExam(id, exam);
    }

    @DeleteMapping("/exams/{id}")
    public void deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
    }

    // ==================== QUESTION ENDPOINTS ====================

    @PostMapping("/exams/{examId}/questions")
    public Question createQuestion(@RequestBody Question question, @PathVariable Long examId) {
        return questionService.createQuestion(question, examId);
    }

    @GetMapping("/questions")
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @GetMapping("/questions/{id}")
    public Question getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    @GetMapping("/exams/{examId}/questions")
    public List<Question> getQuestionsByExamId(@PathVariable Long examId) {
        return questionService.getQuestionsByExamId(examId);
    }

    @PutMapping("/questions/{id}")
    public Question updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }

    @DeleteMapping("/questions/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
    }

    @DeleteMapping("/exams/{examId}/questions")
    public void deleteQuestionsByExamId(@PathVariable Long examId) {
        questionService.deleteQuestionsByExamId(examId);
    }

    @GetMapping("/questions/{id}/check")
    public boolean checkAnswer(@PathVariable Long id, @RequestParam String answer) {
        return questionService.checkAnswer(id, answer);
    }

    @GetMapping("/exams/{examId}/questions/count")
    public long countQuestionsByExamId(@PathVariable Long examId) {
        return questionService.countQuestionsByExamId(examId);
    }

    // ==================== EVALUATION ENDPOINTS ====================

    @PostMapping("/exams/{examId}/evaluations")
    public Evaluation createEvaluation(@RequestBody Evaluation evaluation, @PathVariable Long examId) {
        return evaluationService.createEvaluation(evaluation, examId);
    }

    @GetMapping("/evaluations")
    public List<Evaluation> getAllEvaluations() {
        return evaluationService.getAllEvaluations();
    }

    @GetMapping("/evaluations/{id}")
    public Evaluation getEvaluationById(@PathVariable Long id) {
        return evaluationService.getEvaluationById(id);
    }

    @GetMapping("/exams/{examId}/evaluations")
    public List<Evaluation> getEvaluationsByExamId(@PathVariable Long examId) {
        return evaluationService.getEvaluationsByExamId(examId);
    }

    @GetMapping("/users/{userId}/evaluations")
    public List<Evaluation> getEvaluationsByUserId(@PathVariable Long userId) {
        return evaluationService.getEvaluationsByUserId(userId);
    }

    @PutMapping("/evaluations/{id}")
    public Evaluation updateEvaluation(@PathVariable Long id, @RequestBody Evaluation evaluation) {
        return evaluationService.updateEvaluation(id, evaluation);
    }

    @DeleteMapping("/evaluations/{id}")
    public void deleteEvaluation(@PathVariable Long id) {
        evaluationService.deleteEvaluation(id);
    }

    @GetMapping("/evaluations/passed")
    public List<Evaluation> getPassedEvaluations() {
        return evaluationService.getPassedEvaluations();
    }

    @GetMapping("/evaluations/failed")
    public List<Evaluation> getFailedEvaluations() {
        return evaluationService.getFailedEvaluations();
    }

    @GetMapping("/users/{userId}/evaluations/status")
    public List<Evaluation> getEvaluationsByUserAndStatus(
            @PathVariable Long userId,
            @RequestParam Boolean passed) {
        return evaluationService.getEvaluationsByUserAndStatus(userId, passed);
    }

    @GetMapping("/exams/{examId}/evaluations/average")
    public Double getAverageScoreByExamId(@PathVariable Long examId) {
        return evaluationService.getAverageScoreByExamId(examId);
    }

    @GetMapping("/exams/{examId}/evaluations/pass-rate")
    public Double getPassRateByExamId(@PathVariable Long examId) {
        return evaluationService.getPassRateByExamId(examId);
    }

    // ==================== CERTIFICATE ENDPOINTS ====================

    @PostMapping("/evaluations/{evaluationId}/certificate")
    public Certificate createCertificate(@PathVariable Long evaluationId) {
        return certificateService.createCertificate(evaluationId);
    }

    @GetMapping("/certificates")
    public List<Certificate> getAllCertificates() {
        return certificateService.getAllCertificates();
    }

    @GetMapping("/certificates/{id}")
    public Certificate getCertificateById(@PathVariable Long id) {
        return certificateService.getCertificateById(id);
    }

    @GetMapping("/evaluations/{evaluationId}/certificate")
    public Certificate getCertificateByEvaluationId(@PathVariable Long evaluationId) {
        return certificateService.getCertificateByEvaluationId(evaluationId);
    }

    @GetMapping("/users/{userId}/certificates")
    public List<Certificate> getCertificatesByUserId(@PathVariable Long userId) {
        return certificateService.getCertificatesByUserId(userId);
    }

    @GetMapping("/users/{userId}/exams/{examId}/certificate")
    public Certificate getCertificateByUserAndExam(
            @PathVariable Long userId,
            @PathVariable Long examId) {
        return certificateService.getCertificateByUserAndExam(userId, examId);
    }

    @PutMapping("/certificates/{id}")
    public Certificate updateCertificate(@PathVariable Long id, @RequestBody Certificate certificate) {
        return certificateService.updateCertificate(id, certificate);
    }

    @DeleteMapping("/certificates/{id}")
    public void deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
    }

    @DeleteMapping("/evaluations/{evaluationId}/certificate")
    public void deleteCertificateByEvaluationId(@PathVariable Long evaluationId) {
        certificateService.deleteCertificateByEvaluationId(evaluationId);
    }

    @GetMapping("/certificates/verify/{code}")
    public boolean verifyCertificate(@PathVariable String code) {
        return certificateService.verifyCertificate(code);
    }

    @GetMapping("/certificates/code/{code}")
    public Certificate getCertificateByCode(@PathVariable String code) {
        return certificateService.getCertificateByCode(code);
    }

    @GetMapping("/users/{userId}/certificates/count")
    public long countCertificatesByUser(@PathVariable Long userId) {
        return certificateService.countCertificatesByUser(userId);
    }

    @PostMapping("/exams/{examId}/certificates/bulk")
    public List<Certificate> createCertificatesForExam(@PathVariable Long examId) {
        return certificateService.createCertificatesForExam(examId);
    }

    @PostMapping("/exams/{examId}/submit")
    public SubmitExamResponse submitExam(
            @PathVariable Long examId,
            @RequestBody SubmitExamRequest request) {
        request.setExamId(examId);
        return evaluationService.submitExam(request);
    }

    @GetMapping("/evaluations/{evaluationId}/answers")
    public List<UserAnswer> getAnswersByEvaluationId(@PathVariable Long evaluationId) {
        return userAnswerRepository.findByEvaluationId(evaluationId);
    }

    @PostMapping
    public ResponseEntity<?> logViolation(@RequestBody ExamViolation violation) {
        violationRepository.save(violation);
        return ResponseEntity.ok("logged");
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<List<ExamViolation>> getViolations(@PathVariable Long attemptId) {
        return ResponseEntity.ok(
                violationRepository.findByExamAttemptId(attemptId));
    }
}
