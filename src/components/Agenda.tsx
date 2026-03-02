import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  differenceInDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  Clock,
  Zap,
  Brain
} from 'lucide-react';
import { AppState, Task, Priority } from '../types';

interface AgendaProps {
  state: AppState;
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
}

export default function Agenda({ state, onAddTask, onToggleTask }: AgendaProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    isRecurring: false,
    subjectId: ''
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const tasksForSelectedDate = state.tasks.filter(t => isSameDay(parseISO(t.date), selectedDate));
  
  // Cognitive Load Calculation
  const getCognitiveLoad = (date: Date) => {
    const dayTasks = state.tasks.filter(t => isSameDay(parseISO(t.date), date));
    let load = 0;
    dayTasks.forEach(t => {
      const subject = state.subjects.find(s => s.id === t.subjectId);
      const weight = subject?.weight || 1;
      const priorityBonus = t.priority === 'high' ? 2 : t.priority === 'medium' ? 1 : 0.5;
      load += weight * priorityBonus;
    });
    return load;
  };

  const selectedDayLoad = getCognitiveLoad(selectedDate);
  
  const getOverloadLevel = (load: number) => {
    if (load > 15) return { label: 'Intenso', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (load > 8) return { label: 'Moderado', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'Leve', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const overload = getOverloadLevel(selectedDayLoad);

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      date: selectedDate.toISOString(),
      priority: newTask.priority,
      completed: false,
      isRecurring: newTask.isRecurring,
      subjectId: newTask.subjectId || undefined
    };
    
    onAddTask(task);
    setShowTaskModal(false);
    setNewTask({ title: '', description: '', priority: 'medium', isRecurring: false, subjectId: '' });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded-ios"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded-ios"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="card bg-bg-light dark:bg-black-soft p-4">
            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-bold opacity-40 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const dayLoad = getCognitiveLoad(day);
                const isOverloaded = dayLoad > 15;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-ios relative transition-all
                      ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                      ${isSelected ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep' : 'hover:bg-gray-light dark:hover:bg-gray-mid'}
                    `}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {dayLoad > 0 && (
                      <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-bg-light dark:bg-black-deep' : dayLoad > 10 ? 'bg-rose-500' : 'bg-black-deep dark:bg-bg-light'}`} />
                    )}
                    {isOverloaded && (
                      <div className="absolute top-1 right-1">
                        <AlertTriangle size={10} className="text-rose-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cognitive Load Map */}
          <div className="card bg-bg-light dark:bg-black-soft">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Brain size={20} className="opacity-60" />
                <span className="text-sm font-bold">Carga Cognitiva Diária</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${overload.bg} ${overload.color}`}>
                Nível {overload.label}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-light dark:bg-gray-mid rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${selectedDayLoad > 15 ? 'bg-rose-500' : selectedDayLoad > 8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (selectedDayLoad / 20) * 100)}%` }} 
                />
              </div>
              <p className="text-[10px] opacity-40 text-center">Score de complexidade: {selectedDayLoad.toFixed(1)} pts</p>
            </div>
          </div>
        </div>

        {/* Tasks Column */}
        <div className="w-full md:w-80 lg:w-96 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Agenda Estratégica</h3>
              <p className="text-sm opacity-60">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
            </div>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="p-2 bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep rounded-ios"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {tasksForSelectedDate.length > 0 ? (
              tasksForSelectedDate.map((task) => {
                const subject = state.subjects.find(s => s.id === task.subjectId);
                return (
                  <div 
                    key={task.id} 
                    className={`card p-4 flex items-start gap-3 bg-bg-light dark:bg-black-soft transition-opacity ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      className="mt-1"
                    >
                      {task.completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="opacity-40" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className={`font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
                        {subject && (
                          <span className="text-[10px] px-2 py-0.5 bg-gray-light dark:bg-gray-mid rounded-full opacity-60">
                            Peso {subject.weight}
                          </span>
                        )}
                      </div>
                      {task.description && <div className="text-xs opacity-60 mt-1">{task.description}</div>}
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                        {task.completed && (
                          <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <Zap size={10} /> +2.5 pts performance
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 opacity-40 italic">
                Nenhuma tarefa estratégica.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold">Nova Tarefa Estratégica</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Título</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="Ex: Resolver lista de Logaritmos"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Matéria Relacionada (Opcional)</label>
                <select 
                  value={newTask.subjectId}
                  onChange={e => setNewTask(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                >
                  <option value="">Nenhuma</option>
                  {state.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Peso {s.weight})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Descrição</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none h-24 resize-none"
                  placeholder="Detalhes da tarefa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Prioridade</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newTask.isRecurring}
                      onChange={e => setNewTask(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-light"
                    />
                    <span className="text-sm font-medium">Recorrente</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowTaskModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddTask}
                className="btn-primary flex-1"
              >
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
