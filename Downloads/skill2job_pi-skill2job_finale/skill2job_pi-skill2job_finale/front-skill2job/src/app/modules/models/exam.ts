export interface Exam {
  id: number;
  title: string;
  description: string;
  passScore: number;
  questions?: Question[];
  duration?: number;
  createdAt?: Date;
  category?: string; // Add this optional property
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'; // Optional
}

export interface Question {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

export interface Evaluation {
  id?: number;
  userId: number;
  examId: number;
  score: number;
  passed?: boolean;
  completedAt?: Date;
  certificate?: Certificate;
}

export interface Certificate {
  id?: number;
  certificateCode: string;
  issueDate: string;
  userId: number;
  examId: number;
  downloadUrl?: string;
  exam?: Exam;
  level?: 'BRONZE' | 'SILVER' | 'GOLD';
  score?: number;
}

export interface Answer {
  questionId: number;
  selectedOption: string;
}

export interface ExamSubmission {
  examId: number;
  userId: number;
  answers: Answer[];
}
