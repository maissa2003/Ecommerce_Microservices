export interface Exam {
  id?: number;
  title: string;
  description: string;
  passScore: number;
  evaluations?: Evaluation[]; // Optional
  questions?: Question[]; // Optional
}

export interface Question {
  id?: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  exam?: { id: number }; // Changed from examId to match backend
}

export interface Evaluation {
  id?: number;
  userId: number;
  score: number;
  passed?: boolean;
  exam?: { id: number }; // Changed from examId to match backend
  certificate?: Certificate; // Optional
}

export interface Certificate {
  id?: number;
  certificateCode: string;
  issueDate: string;
  evaluation?: { id: number }; // Changed from evaluationId to match backend
}
