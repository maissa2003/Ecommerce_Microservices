package tn.esprit.gestionexam.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.entities.Question;
import tn.esprit.gestionexam.repositories.ExamRepository;
import tn.esprit.gestionexam.repositories.QuestionRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionService Unit Tests")
class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ExamRepository examRepository;

    @InjectMocks
    private QuestionService questionService;

    private Examen sampleExam;
    private Question sampleQuestion;

    @BeforeEach
    void setUp() {
        sampleExam = new Examen();
        sampleExam.setId(1L);
        sampleExam.setTitle("Java Basics");

        sampleQuestion = new Question();
        sampleQuestion.setId(1L);
        sampleQuestion.setContent("What is a class?");
        sampleQuestion.setOptionA("A template");
        sampleQuestion.setOptionB("An instance");
        sampleQuestion.setOptionC("A variable");
        sampleQuestion.setOptionD("A method");
        sampleQuestion.setCorrectAnswer("A");
        sampleQuestion.setExam(sampleExam);
    }

    @Test
    @DisplayName("Should create question successfully")
    void createQuestion_WithValidExam_ShouldReturnSavedQuestion() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));
        when(questionRepository.save(any(Question.class))).thenReturn(sampleQuestion);

        Question result = questionService.createQuestion(sampleQuestion, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getExam()).isEqualTo(sampleExam);
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should return all questions")
    void getAllQuestions_ShouldReturnList() {
        when(questionRepository.findAll()).thenReturn(Arrays.asList(sampleQuestion));

        List<Question> result = questionService.getAllQuestions();

        assertThat(result).hasSize(1);
        verify(questionRepository).findAll();
    }

    @Test
    @DisplayName("Should return questions by exam ID")
    void getQuestionsByExamId_ShouldReturnList() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));
        when(questionRepository.findByExam(sampleExam)).thenReturn(Arrays.asList(sampleQuestion));

        List<Question> result = questionService.getQuestionsByExamId(1L);

        assertThat(result).hasSize(1);
        verify(questionRepository).findByExam(sampleExam);
    }

    @Test
    @DisplayName("Should update question successfully")
    void updateQuestion_ShouldReturnUpdatedQuestion() {
        Question details = new Question();
        details.setContent("Updated Content");

        when(questionRepository.findById(1L)).thenReturn(Optional.of(sampleQuestion));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question result = questionService.updateQuestion(1L, details);

        assertThat(result.getContent()).isEqualTo("Updated Content");
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should delete questions by exam ID")
    void deleteQuestionsByExamId_ShouldCallDeleteAll() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));
        when(questionRepository.findByExam(sampleExam)).thenReturn(Arrays.asList(sampleQuestion));

        questionService.deleteQuestionsByExamId(1L);

        verify(questionRepository).deleteAll(anyList());
    }

    @Test
    @DisplayName("Should count questions by exam ID")
    void countQuestionsByExamId_ShouldReturnCount() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));
        when(questionRepository.findByExam(sampleExam)).thenReturn(Arrays.asList(sampleQuestion));

        long count = questionService.countQuestionsByExamId(1L);

        assertThat(count).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should check answer correctly")
    void checkAnswer_ShouldReturnBoolean() {
        when(questionRepository.findById(1L)).thenReturn(Optional.of(sampleQuestion));

        assertThat(questionService.checkAnswer(1L, "A")).isTrue();
        assertThat(questionService.checkAnswer(1L, "B")).isFalse();
    }
}
