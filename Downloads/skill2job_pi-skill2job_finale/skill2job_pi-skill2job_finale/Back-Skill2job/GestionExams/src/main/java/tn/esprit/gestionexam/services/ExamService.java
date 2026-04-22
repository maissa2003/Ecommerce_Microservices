package tn.esprit.gestionexam.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.repositories.ExamRepository;

import java.util.List;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    // Create
    public Examen createExam(Examen exam) {
        return examRepository.save(exam);
    }

    // Read all
    public List<Examen> getAllExams() {
        return examRepository.findAll();
    }

    // Read by ID
    public Examen getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
    }

    // Update
    public Examen updateExam(Long id, Examen examDetails) {
        Examen existingExam = getExamById(id);

        existingExam.setTitle(examDetails.getTitle());
        existingExam.setDescription(examDetails.getDescription());
        existingExam.setPassScore(examDetails.getPassScore());

        return examRepository.save(existingExam);
    }

    // Delete
    public void deleteExam(Long id) {
        Examen exam = getExamById(id);
        examRepository.delete(exam);
    }

    // Additional method: Check if exam exists
    public boolean existsById(Long id) {
        return examRepository.existsById(id);
    }
}