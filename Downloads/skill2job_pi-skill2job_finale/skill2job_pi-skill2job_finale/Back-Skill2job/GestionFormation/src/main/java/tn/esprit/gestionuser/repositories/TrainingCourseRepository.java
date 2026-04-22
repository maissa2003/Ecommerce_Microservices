package tn.esprit.gestionuser.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.gestionuser.entities.TrainingCourse;

import java.util.List;

@Repository
public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, Long> {
    List<TrainingCourse> findByCategoryId(Long categoryId);
    // cours par trainer
    List<TrainingCourse> findByTrainerId(Long trainerId);
}