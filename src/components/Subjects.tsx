import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Hash,
  CheckCircle2,
  AlertCircle,
  Scale
} from 'lucide-react';
import { AppState, Subject } from '../types';

interface SubjectsProps {
  state: AppState;
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onRemoveSubject: (id: string) => void;
}

export default function Subjects({ state, onAddSubject, onUpdateSubject, onRemoveSubject }: SubjectsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'humanas' as Subject['category'],
    weight: 1
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ name: '', category: 'humanas', weight: 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, category: subject.category, weight: subject.weight });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingSubject) {
      onUpdateSubject({ ...editingSubject, ...formData });
    } else {
      onAddSubject({
        id: crypto.randomUUID(),
        ...formData
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grade Estratégica</h2>
          <p className="opacity-60">Defina os pesos das matérias para o cálculo de carga cognitiva.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          Nova Matéria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.subjects.map((subject) => (
          <div key={subject.id} className="card bg-bg-light dark:bg-black-soft flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-ios ${subject.category === 'exatas' ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep' : 'bg-gray-light dark:bg-gray-mid'}`}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold">{subject.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    {subject.category}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    <Scale size={10} /> Peso {subject.weight}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleOpenEdit(subject)}
                className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded-ios transition-colors"
              >
                <Edit2 size={18} className="opacity-60" />
              </button>
              {!subject.isDefault && (
                <button 
                  onClick={() => onRemoveSubject(subject.id)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-ios transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold">{editingSubject ? 'Editar Matéria' : 'Nova Matéria'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Nome da Matéria</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="Ex: Literatura, Sociologia..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Peso Estratégico (1-5)</label>
                <input 
                  type="number" 
                  min="1"
                  max="5"
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['exatas', 'humanas'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      className={`p-3 rounded-ios border transition-all font-bold uppercase text-xs tracking-widest ${
                        formData.category === cat 
                          ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep border-transparent' 
                          : 'border-gray-light dark:border-gray-mid opacity-60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSubmit} className="btn-primary flex-1">
                {editingSubject ? 'Salvar Alterações' : 'Criar Matéria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
