// SubmitExamResponse.java  (new DTO)
package tn.esprit.gestionexam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SubmitExamResponse {
    private Double score;
    private Boolean passed;
    private Long evaluationId;
    private String certificateCode;  // null if failed
}