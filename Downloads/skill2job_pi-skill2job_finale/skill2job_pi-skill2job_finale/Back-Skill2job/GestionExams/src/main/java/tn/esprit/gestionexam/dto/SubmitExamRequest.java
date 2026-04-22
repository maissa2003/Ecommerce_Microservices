package tn.esprit.gestionexam.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SubmitExamRequest {
    private Long examId;
    private Long userId;
    private List<AnswerDto> answers;

    @Getter
    @Setter
    public static class AnswerDto {
        private Long questionId;
        private String selectedOption;
    }
}