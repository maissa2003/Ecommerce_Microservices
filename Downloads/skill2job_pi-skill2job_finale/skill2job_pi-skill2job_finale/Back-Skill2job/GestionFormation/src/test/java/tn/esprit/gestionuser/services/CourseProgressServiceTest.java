package tn.esprit.gestionuser.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.CourseProgress;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.repositories.CourseProgressRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CourseProgressService Unit Tests")
class CourseProgressServiceTest {

    @Mock
    private CourseProgressRepository progressRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private CourseProgressService courseProgressService;

    private UserDTO sampleUser;
    private CourseProgress sampleProgress;

    @BeforeEach
    void setUp() {
        sampleUser = new UserDTO();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");

        sampleProgress = new CourseProgress();
        sampleProgress.setId(1L);
        sampleProgress.setUserId(1L);
        sampleProgress.setCourseId(10L);
        sampleProgress.setTotalLessons(10);
        sampleProgress.setCompletedLessons(5);
        sampleProgress.setProgressPercentage(50.0);
        sampleProgress.setIsCompleted(false);
        sampleProgress.setRewardClaimed(false);
    }

    @Test
    @DisplayName("Should start course and return existing progress if it exists")
    void startCourse_AlreadyExists_ShouldReturnExisting() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(sampleProgress));

        CourseProgress result = courseProgressService.startCourse("testuser", 10L, 10);

        assertThat(result).isEqualTo(sampleProgress);
        verify(progressRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update progress and calculate completion")
    void updateProgress_CompletingCourse_ShouldAwardReward() {
        sampleProgress.setCompletedLessons(9); // 9/10 completed
        sampleProgress.setProgressPercentage(90.0);

        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(sampleProgress));
        when(progressRepository.save(any(CourseProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseProgress result = courseProgressService.updateProgress("testuser", 10L, 10);

        assertThat(result.getCompletedLessons()).isEqualTo(10);
        assertThat(result.getProgressPercentage()).isEqualTo(100.0);
        assertThat(result.getIsCompleted()).isTrue();
        assertThat(result.getRewardClaimed()).isTrue();
        
        verify(walletService).credit(eq("testuser"), eq(50.0), anyString(), eq(TransactionType.CREDIT));
        verify(progressRepository, times(2)).save(any(CourseProgress.class)); // Saved once for progress, once for rewardClaimed
    }

    @Test
    @DisplayName("Should throw exception if user not found")
    void startCourse_UserNotFound_ShouldThrowException() {
        when(userClient.getUserByUsername("unknown")).thenReturn(null);

        assertThatThrownBy(() -> courseProgressService.startCourse("unknown", 10L, 10))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should get all user progress")
    void getMyProgress_ShouldReturnList() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(progressRepository.findByUserId(1L)).thenReturn(Arrays.asList(sampleProgress));

        List<CourseProgress> result = courseProgressService.getMyProgress("testuser");

        assertThat(result).hasSize(1);
        verify(progressRepository).findByUserId(1L);
    }

    @Test
    @DisplayName("Should reset progress successfully")
    void resetProgress_ShouldClearFields() {
        when(userClient.getUserByUsername("testuser")).thenReturn(sampleUser);
        when(progressRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(sampleProgress));
        when(progressRepository.save(any(CourseProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseProgress result = courseProgressService.resetProgress("testuser", 10L);

        assertThat(result.getCompletedLessons()).isEqualTo(0);
        assertThat(result.getIsCompleted()).isFalse();
        assertThat(result.getRewardClaimed()).isFalse();
    }
}
