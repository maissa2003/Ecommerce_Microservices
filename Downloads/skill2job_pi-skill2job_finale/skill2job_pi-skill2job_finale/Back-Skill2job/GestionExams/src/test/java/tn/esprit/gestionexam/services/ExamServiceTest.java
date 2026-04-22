package tn.esprit.gestionexam.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionexam.entities.Examen;
import tn.esprit.gestionexam.repositories.ExamRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExamService Unit Tests")
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @InjectMocks
    private ExamService examService;

    private Examen sampleExam;

    @BeforeEach
    void setUp() {
        sampleExam = new Examen();
        sampleExam.setId(1L);
        sampleExam.setTitle("Java Certification");
        sampleExam.setDescription("Test your Java knowledge");
        sampleExam.setPassScore(70.0);
    }

    @Test
    @DisplayName("Should create exam successfully")
    void createExam_ShouldReturnSavedExam() {
        when(examRepository.save(any(Examen.class))).thenReturn(sampleExam);

        Examen result = examService.createExam(sampleExam);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Java Certification");
        verify(examRepository).save(any(Examen.class));
    }

    @Test
    @DisplayName("Should return all exams")
    void getAllExams_ShouldReturnList() {
        when(examRepository.findAll()).thenReturn(Arrays.asList(sampleExam));

        List<Examen> result = examService.getAllExams();

        assertThat(result).hasSize(1);
        verify(examRepository).findAll();
    }

    @Test
    @DisplayName("Should return exam by ID when exists")
    void getExamById_WhenExists_ShouldReturnExam() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));

        Examen result = examService.getExamById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when exam not found")
    void getExamById_WhenNotExists_ShouldThrowException() {
        when(examRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> examService.getExamById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Exam not found");
    }

    @Test
    @DisplayName("Should update exam successfully")
    void updateExam_ShouldReturnUpdatedExam() {
        Examen updatedDetails = new Examen();
        updatedDetails.setTitle("Advanced Java");
        updatedDetails.setDescription("Master Java concepts");
        updatedDetails.setPassScore(80.0);

        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));
        when(examRepository.save(any(Examen.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Examen result = examService.updateExam(1L, updatedDetails);

        assertThat(result.getTitle()).isEqualTo("Advanced Java");
        assertThat(result.getPassScore()).isEqualTo(80.0);
        verify(examRepository).save(any(Examen.class));
    }

    @Test
    @DisplayName("Should delete exam successfully")
    void deleteExam_ShouldCallDelete() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(sampleExam));

        examService.deleteExam(1L);

        verify(examRepository).delete(sampleExam);
    }

    @Test
    @DisplayName("Should return true when exam exists")
    void existsById_WhenExists_ShouldReturnTrue() {
        when(examRepository.existsById(1L)).thenReturn(true);

        boolean result = examService.existsById(1L);

        assertThat(result).isTrue();
    }
}
