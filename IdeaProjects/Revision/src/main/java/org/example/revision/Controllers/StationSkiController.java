package org.example.revision.Controllers;

import lombok.AllArgsConstructor;
import org.example.revision.Services.Classes.StationSkiServiceImpl;
import org.example.revision.entities.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/station")
@AllArgsConstructor
public class StationSkiController {

    private final StationSkiServiceImpl stationSkiService;

    @PostMapping("/inscription/addToSkieur/{numSkieur}")
    public Inscription addRegistrationToSkier(@RequestBody Inscription insc,
                                              @PathVariable Long numSkieur) {
        return stationSkiService.addRegistrationAndAssignToSkier(insc, numSkieur);
    }

    @PostMapping("/inscription/assignToCourse/{numInscription}/{numCourse}")
    public Inscription assignRegistrationToCourse(@PathVariable Long numInscription,
                                                  @PathVariable Long numCourse) {
        return stationSkiService.assignRegistrationToCourse(numInscription, numCourse);
    }

    @PostMapping("/skieur/assignToPiste/{numSkieur}/{numPiste}")
    public Skieur assignSkierToPiste(@PathVariable Long numSkieur,
                                     @PathVariable Long numPiste) {
        return stationSkiService.assignSkierToPiste(numSkieur, numPiste);
    }

    @PostMapping("/moniteur/addAndAssign/{numCourse}")
    public Moniteur addInstructorAndAssign(@RequestBody Moniteur moniteur,
                                           @PathVariable Long numCourse) {
        return stationSkiService.addInstructorAndAssignToCourse(moniteur, numCourse);
    }

    @PostMapping("/skieur/addAndAssign/{numCourse}")
    public Skieur addSkierAndAssign(@RequestBody Skieur skieur,
                                    @PathVariable Long numCourse) {
        return stationSkiService.addSkierAndAssignToCourse(skieur, numCourse);
    }

    @GetMapping("/skieurs/bySubscription/{typeAbonnement}")
    public List<Skieur> getSkiersByType(@PathVariable TypeAbonnement typeAbonnement) {
        return stationSkiService.retrieveSkiersBySubscriptionType(typeAbonnement);
    }

    @GetMapping("/abonnements/byType/{typeAbonnement}")
    public Set<Abonnement> getAbonnementsByType(@PathVariable TypeAbonnement typeAbonnement) {
        return stationSkiService.getSubscriptionByType(typeAbonnement);
    }

    @GetMapping("/abonnements/byDates")
    public List<Abonnement> getAbonnementsByDates(@RequestParam LocalDate startDate,
                                                  @RequestParam LocalDate endDate) {
        return stationSkiService.retrieveSubscriptionsByDates(startDate, endDate);
    }

    @PostMapping("/inscription/addToSkieurAndCourse/{numSkieur}/{numCourse}")
    public Inscription addRegistrationToSkierAndCourse(@RequestBody Inscription insc,
                                                       @PathVariable Long numSkieur,
                                                       @PathVariable Long numCourse) {
        return stationSkiService.addRegistrationAndAssignToSkierAndCourse(insc, numSkieur, numCourse);
    }

    @GetMapping("/moniteur/weeksBySupport/{numInstructor}")
    public List<Integer> getWeeksBySupport(@PathVariable Long numInstructor,
                                           @RequestParam String support) {
        return stationSkiService.numWeeksCourseOfInstructorBySupport(numInstructor, support);
    }
}
