package tn.esprit.gestionexam.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.entities.Question;
import tn.esprit.gestionexam.repositories.ExamRepository;
import tn.esprit.gestionexam.repositories.QuestionRepository;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    // Create
    public Question createQuestion(Question question, Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + examId));
        question.setExam(exam);
        return questionRepository.save(question);
    }

    // Read all
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Read by ID
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    // Read by Exam
    public List<Question> getQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + examId));
        return questionRepository.findByExam(exam);
    }

    // Update
    public Question updateQuestion(Long id, Question questionDetails) {
        Question existingQuestion = getQuestionById(id);

        existingQuestion.setContent(questionDetails.getContent());
        existingQuestion.setOptionA(questionDetails.getOptionA());
        existingQuestion.setOptionB(questionDetails.getOptionB());
        existingQuestion.setOptionC(questionDetails.getOptionC());
        existingQuestion.setOptionD(questionDetails.getOptionD());
        existingQuestion.setCorrectAnswer(questionDetails.getCorrectAnswer());

        // Update exam if provided
        if (questionDetails.getExam() != null && questionDetails.getExam().getId() != null) {
            Examen newExam = examRepository.findById(questionDetails.getExam().getId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            existingQuestion.setExam(newExam);
        }

        return questionRepository.save(existingQuestion);
    }

    // Delete
    public void deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        questionRepository.delete(question);
    }

    // Delete all questions of an exam
    public void deleteQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        List<Question> questions = questionRepository.findByExam(exam);
        questionRepository.deleteAll(questions);
    }

    // Count questions by exam
    public long countQuestionsByExamId(Long examId) {
        Examen exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return questionRepository.findByExam(exam).size();
    }

    // Check answer correctness
    public boolean checkAnswer(Long questionId, String userAnswer) {
        Question question = getQuestionById(questionId);
        return question.getCorrectAnswer().equalsIgnoreCase(userAnswer);
    }
}