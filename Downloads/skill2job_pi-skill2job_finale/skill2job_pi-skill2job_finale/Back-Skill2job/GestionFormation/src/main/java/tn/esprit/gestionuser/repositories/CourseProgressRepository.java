package tn.esprit.gestionuser.repositories;

import tn.esprit.gestionuser.entities.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    Optional<CourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    List<CourseProgress> findByUserId(Long userId);

    List<CourseProgress> findByUserIdAndIsCompleted(Long userId, Boolean isCompleted);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<CourseProgress> findByUserIdAndIsCompletedAndRewardClaimed(Long userId, Boolean isCompleted, Boolean rewardClaimed);
}