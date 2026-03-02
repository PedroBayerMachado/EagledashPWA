import React, { useState } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { AppState, TargetExam } from '../types';
import { format, parseISO, differenceInWeeks, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TargetExamProps {
  state: AppState;
  onSetTarget: (exam: TargetExam) => void;
}

export default function TargetExamComponent({ state, onSetTarget }: TargetExamProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TargetExam>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    minHoursPerWeek: 20
  });

  const target = state.targetExam;
  const now = new Date();
  
  const weeksRemaining = target ? differenceInWeeks(parseISO(target.date), now) : 0;
  const daysRemaining = target ? differenceInDays(parseISO(target.date), now) : 0;

  const handleSave = () => {
    if (!formData.name) return;
    onSetTarget({
      ...formData,
      date: new Date(formData.date).toISOString()
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plano de Prova</h2>
          <p className="opacity-60">Meta-alvo e planejamento estratégico de longo prazo.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          {target ? 'Editar Meta' : 'Definir Meta-Alvo'}
        </button>
      </div>

      {target ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Countdown & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Contagem Regressiva</div>
                <div className="text-5xl font-bold tracking-tighter">{target.name}</div>
                <div className="text-sm opacity-60 mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={14} />
                  {format(parseISO(target.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{weeksRemaining}</div>
                  <div className="text-[10px] font-bold uppercase opacity-40">Semanas</div>
                </div>
                <div className="w-px h-12 bg-bg-light/20 dark:bg-black-deep/20" />
                <div className="text-center">
                  <div className="text-4xl font-bold">{daysRemaining}</div>
                  <div className="text-[10px] font-bold uppercase opacity-40">Dias</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card bg-bg-light dark:bg-black-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
                    <Clock size={20} />
                  </div>
                  <h3 className="font-bold">Carga Necessária</h3>
                </div>
                <div className="text-3xl font-bold">{target.minHoursPerWeek}h/semana</div>
                <p className="text-xs opacity-60 mt-2">Mínimo sugerido para cobrir o edital com base no peso das matérias.</p>
              </div>

              <div className="card bg-bg-light dark:bg-black-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-bold">Projeção de Resultado</h3>
                </div>
                <div className="text-3xl font-bold text-emerald-500">Evolutiva</div>
                <p className="text-xs opacity-60 mt-2">Tendência matemática baseada na sua constância atual.</p>
              </div>
            </div>
          </div>

          {/* Distribution Suggestion */}
          <div className="card bg-bg-light dark:bg-black-soft">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Scale size={20} className="opacity-60" />
              Distribuição Ideal
            </h3>
            <div className="space-y-4">
              {state.subjects.sort((a, b) => b.weight - a.weight).slice(0, 5).map(subject => {
                const percentage = (subject.weight / state.subjects.reduce((acc, s) => acc + s.weight, 0)) * 100;
                const hours = (percentage / 100) * target.minHoursPerWeek;
                return (
                  <div key={subject.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{subject.name}</span>
                      <span className="opacity-60">{hours.toFixed(1)}h/sem</span>
                    </div>
                    <div className="h-1.5 bg-gray-light dark:bg-gray-mid rounded-full overflow-hidden">
                      <div className="h-full bg-black-deep dark:bg-bg-light" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 rounded-ios bg-bg-ice dark:bg-gray-charcoal border border-dashed border-gray-light dark:border-gray-mid">
              <div className="text-[10px] font-bold uppercase opacity-40 mb-1">Dica Estratégica</div>
              <p className="text-xs opacity-60 italic">Priorize as matérias de maior peso nas semanas de carga intensa.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-bg-light dark:bg-black-soft py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-light dark:bg-gray-mid rounded-full flex items-center justify-center mx-auto">
            <Target size={32} className="opacity-40" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-xl font-bold">Nenhuma Meta Definida</h3>
            <p className="text-sm opacity-60 mt-2">Defina sua prova alvo para que o Eagledash possa calcular seu plano estratégico de estudos.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Começar Planejamento
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold">Configurar Meta-Alvo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Nome da Prova</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="Ex: ENEM 2026, Fuvest..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Data da Prova</label>
                <input 
                  type="date" 
                  value={formData.date.split('T')[0]}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Meta de Horas Semanais</label>
                <input 
                  type="number" 
                  value={formData.minHoursPerWeek}
                  onChange={e => setFormData(prev => ({ ...prev, minHoursPerWeek: parseInt(e.target.value) }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1">Salvar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
