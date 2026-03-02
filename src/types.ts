export type Priority = 'low' | 'medium' | 'high';
export type Evaluation = 'good' | 'medium' | 'review';
export type ErrorType = 'conceito' | 'interpretação' | 'atenção';
export type EnergyPeriod = 'manhã' | 'tarde' | 'noite';

export interface Subject {
  id: string;
  name: string;
  category: 'exatas' | 'humanas' | 'outros';
  weight: number; // Peso da matéria para cálculos de prioridade
  isDefault?: boolean;
}

export interface StudyError {
  id: string;
  type: ErrorType;
  description: string;
  date: string;
}

export interface StudyRecord {
  id: string;
  subjectId: string;
  topic: string;
  date: string;
  evaluation: Evaluation;
  essayGrade?: number;
  mockExamGrade?: number;
  isReview: boolean;
  notes: string;
  durationMinutes: number;
  energyPeriod: EnergyPeriod;
  errors: StudyError[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: Priority;
  completed: boolean;
  isRecurring: boolean;
  subjectId?: string; // Associar tarefa a matéria para peso
}

export interface PomodoroSession {
  id: string;
  date: string;
  focusTime: number;
  breakTime: number;
  cycles: number;
}

export interface PasswordEntry {
  id: string;
  platform: string;
  email: string;
  password: string;
  notes: string;
  iv?: string; // IV para descriptografia
}

export interface NoteBlock {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  fontSize: number;
}

export interface NoteFolder {
  id: string;
  name: string;
  blocks: NoteBlock[];
}

export interface TargetExam {
  name: string;
  date: string;
  minHoursPerWeek: number;
}

export interface AppState {
  subjects: Subject[];
  records: StudyRecord[];
  tasks: Task[];
  pomodoroHistory: PomodoroSession[];
  passwords: PasswordEntry[];
  noteFolders: NoteFolder[];
  theme: 'light' | 'dark';
  vaultPin?: string;
  targetExam?: TargetExam;
  goals: {
    weeklyHours: number;
    monthlyPerformance: number;
    quarterlyGoals: string[];
    isRecoveryActive?: boolean;
  };
}
