import { useState, useEffect } from 'react';
import { AppState, Subject, StudyRecord, Task, PomodoroSession, PasswordEntry, NoteFolder } from '../types';
import { DEFAULT_SUBJECTS } from '../constants';
import { addDays, parseISO } from 'date-fns';

const STORAGE_KEY = 'studyflow_state';

const initialState: AppState = {
  subjects: DEFAULT_SUBJECTS,
  records: [],
  tasks: [],
  pomodoroHistory: [],
  passwords: [],
  noteFolders: [],
  theme: 'light',
  goals: {
    weeklyHours: 0,
    monthlyPerformance: 0,
    quarterlyGoals: [],
  },
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const setVaultPin = (pin: string) => {
    setState(prev => ({ ...prev, vaultPin: pin }));
  };

  const setTargetExam = (exam: AppState['targetExam']) => {
    setState(prev => ({ ...prev, targetExam: exam }));
  };

  const addSubject = (subject: Subject) => {
    setState(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  };

  const updateSubject = (subject: Subject) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subject.id ? subject : s)
    }));
  };

  const removeSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  const addRecord = (record: StudyRecord) => {
    setState(prev => {
      const newState = { ...prev, records: [record, ...prev.records] };
      
      // Spaced Repetition Logic: 2, 7, 30 days
      const intervals = [2, 7, 30];
      const newTasks: Task[] = intervals.map((days, index) => ({
        id: crypto.randomUUID(),
        title: `Revisão ${index + 1}: ${record.topic}`,
        description: `Revisão programada da matéria ${prev.subjects.find(s => s.id === record.subjectId)?.name}`,
        date: addDays(parseISO(record.date), days).toISOString(),
        priority: 'high',
        completed: false,
        isRecurring: false,
        subjectId: record.subjectId
      }));

      return { ...newState, tasks: [...newState.tasks, ...newTasks] };
    });
  };

  const addTask = (task: Task) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const addPomodoro = (session: PomodoroSession) => {
    setState(prev => ({ ...prev, pomodoroHistory: [session, ...prev.pomodoroHistory] }));
  };

  const addPassword = (entry: PasswordEntry) => {
    setState(prev => ({ ...prev, passwords: [...prev.passwords, entry] }));
  };

  const updateNoteFolders = (folders: NoteFolder[]) => {
    setState(prev => ({ ...prev, noteFolders: folders }));
  };

  const updateGoals = (goals: AppState['goals']) => {
    setState(prev => ({ ...prev, goals }));
  };

  return {
    state,
    toggleTheme,
    setVaultPin,
    setTargetExam,
    addSubject,
    updateSubject,
    removeSubject,
    addRecord,
    addTask,
    toggleTask,
    addPomodoro,
    addPassword,
    updateNoteFolders,
    updateGoals,
  };
}
