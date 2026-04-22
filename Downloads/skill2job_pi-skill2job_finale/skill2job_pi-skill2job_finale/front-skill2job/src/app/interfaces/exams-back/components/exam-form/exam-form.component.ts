import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamsService } from '../../services/exams.service';

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent implements OnInit {
  examForm: FormGroup;
  isEditing = false;
  examId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      passScore: [
        70,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ]
    });
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['id'];
    this.isEditing = !!this.examId;

    if (this.isEditing) {
      this.loadExam();
    }
  }

  loadExam(): void {
    this.loading = true;
    this.examsService.getExamById(this.examId!).subscribe({
      next: exam => {
        this.examForm.patchValue({
          title: exam.title,
          description: exam.description,
          passScore: exam.passScore
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading exam:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submitted!', this.examForm.value); // ← ADD THIS
    console.log('Form valid?', this.examForm.valid);
    if (this.examForm.invalid) {
      return;
    }

    this.submitting = true;
    const examData = this.examForm.value;

    if (this.isEditing) {
      this.examsService.updateExam(this.examId!, examData).subscribe({
        next: () => {
          console.log('Exam updated successfully');
          this.router.navigate(['/admin/exams/exam-table']);
        },
        error: error => {
          console.error('Error updating exam:', error);
          this.submitting = false;
        }
      });
    } else {
      this.examsService.createExam(examData).subscribe({
        next: Response => {
          console.log('Exam created successfully:', Response); // ← ADD THIS

          this.router.navigate(['/admin/exams/exam-table']);
        },
        error: error => {
          console.error('Error creating exam:', error);
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/exams/exam-table']);
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.examForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}
