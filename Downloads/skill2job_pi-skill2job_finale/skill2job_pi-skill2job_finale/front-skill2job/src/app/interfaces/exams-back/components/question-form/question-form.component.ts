import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamsService } from '../../services/exams.service';
import { Question } from '../../models/exams.model';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent implements OnInit {
  questionForm: FormGroup;
  examId: number | null = null;
  questionId: number | null = null;
  isEditing = false;
  loading = false;
  submitting = false;

  // Added missing properties
  errorMessage = '';
  successMessage = '';
  examTitle = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService
  ) {
    this.questionForm = this.fb.group({
      content: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: [''],
      optionD: [''],
      correctAnswer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const routeId = this.route.snapshot.params['id'];
    this.examId = this.route.snapshot.params['examId']
      ? Number(this.route.snapshot.params['examId'])
      : null;
    this.questionId = routeId ? Number(routeId) : null;
    this.isEditing = !!this.questionId;

    if (this.isEditing) {
      this.loadQuestion();
    } else if (this.examId) {
      this.loadExamDetails();
    } else {
      this.errorMessage =
        'Exam ID is required to add a question. Select an exam from the questions list.';
      setTimeout(() => {
        this.router.navigate(['/admin/exams/question-table']);
      }, 2000);
    }
  }

  loadExamDetails(): void {
    if (this.examId) {
      this.examsService.getExamById(this.examId).subscribe({
        next: exam => {
          this.examTitle = exam.title;
        },
        error: error => {
          console.error('Error loading exam details:', error);
        }
      });
    }
  }

  loadQuestion(): void {
    this.loading = true;
    this.errorMessage = '';

    this.examsService.getQuestionById(this.questionId!).subscribe({
      next: (question: Question) => {
        this.examId = question.exam?.id ?? null;
        if (this.examId) {
          this.loadExamDetails();
        }
        this.questionForm.patchValue({
          content: question.content,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC || '',
          optionD: question.optionD || '',
          correctAnswer: question.correctAnswer
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading question:', error);
        this.errorMessage = 'Failed to load question details';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.questionForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.questionForm.controls).forEach(key => {
        this.questionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Fix: Ensure examId is a number, not null
    if (!this.examId && !this.isEditing) {
      this.errorMessage = 'Exam ID is missing';
      this.submitting = false;
      return;
    }

    const questionData: any = {
      content: this.questionForm.value.content,
      optionA: this.questionForm.value.optionA,
      optionB: this.questionForm.value.optionB,
      optionC: this.questionForm.value.optionC || '',
      optionD: this.questionForm.value.optionD || '',
      correctAnswer: this.questionForm.value.correctAnswer,
      exam: { id: this.examId! } // Non-null assertion since we checked above
    };

    if (this.isEditing) {
      if (!this.examId) {
        this.errorMessage = 'Exam reference missing. Cannot update question.';
        this.submitting = false;
        return;
      }
      this.examsService
        .updateQuestion(this.questionId!, questionData)
        .subscribe({
          next: response => {
            console.log('Question updated:', response);
            this.successMessage = 'Question updated successfully!';
            this.submitting = false;

            setTimeout(() => {
              this.router.navigate([
                '/admin/exams/question-table',
                this.examId
              ]);
            }, 1500);
          },
          error: error => {
            console.error('Error updating question:', error);
            this.errorMessage =
              error.error?.message || 'Failed to update question';
            this.submitting = false;
          }
        });
    } else {
      this.examsService.createQuestion(this.examId!, questionData).subscribe({
        next: response => {
          console.log('Question created:', response);
          this.successMessage = 'Question created successfully!';
          this.submitting = false;

          // Reset form for another question
          this.resetForm();
        },
        error: error => {
          console.error('Error creating question:', error);
          this.errorMessage =
            error.error?.message || 'Failed to create question';
          this.submitting = false;
        }
      });
    }
  }

  // Add missing resetForm method
  resetForm(): void {
    this.questionForm.reset({
      content: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: ''
    });
    this.successMessage = '';

    // Mark as untouched to remove validation styles
    Object.keys(this.questionForm.controls).forEach(key => {
      this.questionForm.get(key)?.markAsUntouched();
    });
  }

  goBack(): void {
    if (this.examId) {
      this.router.navigate(['/admin/exams/question-table', this.examId]);
    } else {
      this.router.navigate(['/admin/exams/question-table']);
    }
  }

  // Keep existing cancel method (can call goBack)
  cancel(): void {
    this.goBack();
  }

  // Add missing isFieldInvalid helper method
  isFieldInvalid(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}
