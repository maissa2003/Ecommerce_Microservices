package tn.esprit.gestionuser.services;

import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.entities.CourseProgress;
import tn.esprit.gestionuser.entities.WalletTransaction.TransactionType;
import tn.esprit.gestionuser.repositories.CourseProgressRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseProgressService {

    private final CourseProgressRepository progressRepository;
    private final UserClient userClient;
    private final WalletService walletService;

    private static final Double COMPLETION_REWARD = 50.0;

    // ══════════════════════════════════════════════════════════════
    // START COURSE
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public CourseProgress startCourse(String username, Long courseId, Integer totalLessons) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // If already started, return existing progress
        return progressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> {
                    CourseProgress progress = new CourseProgress();
                    progress.setUserId(user.getId());
                    progress.setCourseId(courseId);
                    progress.setTotalLessons(totalLessons);
                    progress.setCompletedLessons(0);
                    progress.setProgressPercentage(0.0);
                    progress.setIsCompleted(false);
                    progress.setRewardClaimed(false);
                    return progressRepository.save(progress);
                });
    }

    // ══════════════════════════════════════════════════════════════
    // UPDATE PROGRESS
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public CourseProgress updateProgress(String username, Long courseId, Integer lessonNumber) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        CourseProgress progress = progressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Progress not found. Start the course first."));

        // Increment completed lessons (guard against overflow)
        if (progress.getCompletedLessons() < progress.getTotalLessons()) {
            progress.setCompletedLessons(progress.getCompletedLessons() + 1);
        }

        // ✅ FIX: Calculate completion HERE, not in @PreUpdate
        // @PreUpdate runs inside the flush — the returned object won't reflect it yet.
        int completed = progress.getCompletedLessons();
        int total     = progress.getTotalLessons();

        double percentage = total > 0 ? (completed * 100.0) / total : 0.0;
        progress.setProgressPercentage(percentage);

        boolean justCompleted = percentage >= 100.0 && !progress.getIsCompleted();
        if (justCompleted) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }

        // Save (triggers @PreUpdate but our values are already set correctly)
        CourseProgress saved = progressRepository.save(progress);

        // ✅ FIX: Award reward based on our locally-computed flag, not saved.getIsCompleted()
        if (justCompleted && !saved.getRewardClaimed()) {
            giveCompletionReward(username, courseId);
            saved.setRewardClaimed(true);
            saved = progressRepository.save(saved);
        }

        return saved;
    }

    // ══════════════════════════════════════════════════════════════
    // GIVE COMPLETION REWARD — 50 pts to wallet
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public void giveCompletionReward(String username, Long courseId) {
        walletService.credit(
                username,
                COMPLETION_REWARD,
                "🎓 Course completion reward - Course ID: " + courseId,
                TransactionType.CREDIT
        );
    }

    // ══════════════════════════════════════════════════════════════
    // GET PROGRESS
    // ══════════════════════════════════════════════════════════════
    public CourseProgress getProgress(String username, Long courseId) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return progressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElse(null);
    }

    // ══════════════════════════════════════════════════════════════
    // GET ALL MY PROGRESS
    // ══════════════════════════════════════════════════════════════
    public List<CourseProgress> getMyProgress(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return progressRepository.findByUserId(user.getId());
    }

    // ══════════════════════════════════════════════════════════════
    // GET COMPLETED COURSES
    // ══════════════════════════════════════════════════════════════
    public List<CourseProgress> getCompletedCourses(String username) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return progressRepository.findByUserIdAndIsCompleted(user.getId(), true);
    }

    // ══════════════════════════════════════════════════════════════
    // RESET PROGRESS
    // ══════════════════════════════════════════════════════════════
    @Transactional
    public CourseProgress resetProgress(String username, Long courseId) {
        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        CourseProgress progress = progressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Progress not found"));

        progress.setCompletedLessons(0);
        progress.setProgressPercentage(0.0);
        progress.setIsCompleted(false);
        progress.setCompletedAt(null);
        progress.setRewardClaimed(false);

        return progressRepository.save(progress);
    }
}