import { Subject } from './types';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Matemática', category: 'exatas', isDefault: true, weight: 3 },
  { id: '2', name: 'História', category: 'humanas', isDefault: true, weight: 2 },
  { id: '3', name: 'Geografia', category: 'humanas', isDefault: true, weight: 2 },
  { id: '4', name: 'Português', category: 'humanas', isDefault: true, weight: 3 },
  { id: '5', name: 'Redação', category: 'humanas', isDefault: true, weight: 4 },
  { id: '6', name: 'Filosofia', category: 'humanas', isDefault: true, weight: 1 },
  { id: '7', name: 'Sociologia', category: 'humanas', isDefault: true, weight: 1 },
  { id: '8', name: 'Física', category: 'exatas', isDefault: true, weight: 3 },
  { id: '9', name: 'Química', category: 'exatas', isDefault: true, weight: 2 },
  { id: '10', name: 'Biologia', category: 'exatas', isDefault: true, weight: 2 },
];
