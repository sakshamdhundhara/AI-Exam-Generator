export type QuestionType = "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "FILL_BLANK" | "TRUE_FALSE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "MIXED";

export interface ExamFormValues {
  subject: string;          // e.g. "Biology"
  totalMarks: number;       // e.g. 100
  topics: string[];         // e.g. ["Photosynthesis", "Cell Division"]
  numQuestions: number;     // e.g. 20
  questionTypes: QuestionType[];  // ["MCQ", "SHORT_ANSWER", "LONG_ANSWER"]
  difficultyLevel: Difficulty;    // "EASY" | "MEDIUM" | "HARD" | "MIXED"
  model?: string;           // e.g. "gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.5-flash-lite"
  apiKeyIndex?: number;     // optional index to select specific configured API key
  timeLimit?: number;       // minutes, optional
  instituteName?: string;
  examType?: string;
  course?: string;
  subjectCode?: string;
  semester?: string;
}

export interface MCQOption {
  label: string;    // A, B, C, D
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  difficulty: Difficulty;
  options?: MCQOption[];        // for MCQ only
  answer?: string;              // model answer (stored separately, not in printout)
  explanation?: string;
  topic: string;
  sourceUrl?: string;           // Tavily source
}

export interface ExamSection {
  title: string;               // e.g. "Section A: Multiple Choice"
  instructions: string;
  marks: number;               // marks for this section
  questions: Question[];
}

export interface MarksDistributionRow {
  section: string;
  description: string;
  count: string;
  each: string;
  total: string;
}

export interface ExamMetadata {
  subject: string;
  topics: string[];
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  targetGrade?: string;
  instituteName?: string;
  tagline?: string;
  examType?: string;
  course?: string;
  subjectCode?: string;
  semester?: string;
  examSet?: string;
  timeAllowed?: string;
  marksDistribution?: MarksDistributionRow[];
}

export interface ExamDocument {
  id?: string;
  metadata: ExamMetadata;
  sections: ExamSection[];
  instructions: string[];
  totalMarks: number;
  timeLimit?: number;
  generatedAt: string;  // ISO timestamp
}
