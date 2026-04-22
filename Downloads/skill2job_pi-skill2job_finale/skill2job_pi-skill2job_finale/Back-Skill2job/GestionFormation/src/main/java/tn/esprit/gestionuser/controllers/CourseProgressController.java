package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.entities.CourseProgress;
import tn.esprit.gestionuser.services.CourseProgressService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class CourseProgressController {

    private final CourseProgressService progressService;

    // ══════════════════════════════════════════════════════════════
    // START COURSE
    // ══════════════════════════════════════════════════════════════
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<?> startCourse(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Integer totalLessons = Integer.valueOf(request.get("totalLessons").toString());

            CourseProgress progress = progressService.startCourse(username, courseId, totalLessons);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════════
    // UPDATE PROGRESS (Complete a lesson)
    // ══════════════════════════════════════════════════════════════
    @PutMapping("/update")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<?> updateProgress(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Integer lessonNumber = Integer.valueOf(request.get("lessonNumber").toString());

            CourseProgress progress = progressService.updateProgress(username, courseId, lessonNumber);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════════
    // GET PROGRESS FOR A COURSE
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<?> getProgress(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        CourseProgress progress = progressService.getProgress(username, courseId);

        if (progress == null) {
            return ResponseEntity.ok(Map.of("exists", false));
        }

        return ResponseEntity.ok(progress);
    }

    // ══════════════════════════════════════════════════════════════
    // GET ALL MY PROGRESS
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<List<CourseProgress>> getMyProgress(Authentication authentication) {
        String username = authentication.getName();
        List<CourseProgress> progress = progressService.getMyProgress(username);
        return ResponseEntity.ok(progress);
    }

    // ══════════════════════════════════════════════════════════════
    // GET COMPLETED COURSES
    // ══════════════════════════════════════════════════════════════
    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<List<CourseProgress>> getCompletedCourses(Authentication authentication) {
        String username = authentication.getName();
        List<CourseProgress> completed = progressService.getCompletedCourses(username);
        return ResponseEntity.ok(completed);
    }

    // ══════════════════════════════════════════════════════════════
    // RESET PROGRESS
    // ══════════════════════════════════════════════════════════════
    @PutMapping("/reset/{courseId}")
    @PreAuthorize("hasAnyRole('LEARNER', 'ADMIN')")
    public ResponseEntity<?> resetProgress(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            CourseProgress progress = progressService.resetProgress(username, courseId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}