import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Trash2,
  Zap,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { AppState, StudyRecord, Evaluation, EnergyPeriod, ErrorType, StudyError } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecordsProps {
  state: AppState;
  onAddRecord: (record: StudyRecord) => void;
}

export default function Records({ state, onAddRecord }: RecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [newRecord, setNewRecord] = useState({
    subjectId: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    evaluation: 'good' as Evaluation,
    durationMinutes: 60,
    essayGrade: undefined as number | undefined,
    mockExamGrade: undefined as number | undefined,
    isReview: false,
    notes: '',
    energyPeriod: 'manhã' as EnergyPeriod,
    errors: [] as StudyError[]
  });

  const [newError, setNewError] = useState({
    type: 'conceito' as ErrorType,
    description: ''
  });

  const filteredRecords = state.records.filter(r => {
    const matchesSearch = r.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || r.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleAddRecord = () => {
    if (!newRecord.subjectId || !newRecord.topic) return;
    
    const record: StudyRecord = {
      id: crypto.randomUUID(),
      ...newRecord,
      date: new Date(newRecord.date).toISOString()
    };
    
    onAddRecord(record);
    setShowModal(false);
    setNewRecord({
      subjectId: '',
      topic: '',
      date: new Date().toISOString().split('T')[0],
      evaluation: 'good',
      durationMinutes: 60,
      essayGrade: undefined,
      mockExamGrade: undefined,
      isReview: false,
      notes: '',
      energyPeriod: 'manhã',
      errors: []
    });
  };

  const addErrorToRecord = () => {
    if (!newError.description) return;
    const error: StudyError = {
      id: crypto.randomUUID(),
      type: newError.type,
      description: newError.description,
      date: new Date().toISOString()
    };
    setNewRecord(prev => ({ ...prev, errors: [...prev.errors, error] }));
    setNewError({ type: 'conceito', description: '' });
  };

  const getEvaluationIcon = (evalType: Evaluation) => {
    switch (evalType) {
      case 'good': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'medium': return <HelpCircle size={16} className="text-amber-500" />;
      case 'review': return <AlertCircle size={16} className="text-rose-500" />;
    }
  };

  // Energy Analysis Calculation
  const energyStats = (['manhã', 'tarde', 'noite'] as EnergyPeriod[]).map(period => {
    const periodRecords = state.records.filter(r => r.energyPeriod === period);
    const avgDuration = periodRecords.reduce((acc, r) => acc + r.durationMinutes, 0) / (periodRecords.length || 1);
    return { period, count: periodRecords.length, avgDuration };
  });

  const mostProductivePeriod = [...energyStats].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registros Estratégicos</h2>
          <p className="opacity-60">Diagnóstico de lacunas e análise de energia.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      {/* Energy Insight */}
      {state.records.length > 5 && (
        <div className="card bg-bg-light dark:bg-black-soft flex items-center gap-4 border-emerald-100 dark:border-emerald-900/30">
          <Zap className="text-emerald-500" size={24} />
          <div>
            <div className="text-sm font-bold">Insight de Energia</div>
            <p className="text-xs opacity-60">Seu período mais produtivo é a <span className="font-bold text-emerald-500">{mostProductivePeriod.period}</span> com {mostProductivePeriod.count} sessões registradas.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
          <input 
            type="text" 
            placeholder="Buscar tópico ou erro..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-bg-light dark:bg-black-soft p-3 pl-12 rounded-ios outline-none border border-gray-light dark:border-gray-mid"
          />
        </div>
        <select 
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="bg-bg-light dark:bg-black-soft p-3 rounded-ios outline-none border border-gray-light dark:border-gray-mid min-w-[150px]"
        >
          <option value="all">Todas Matérias</option>
          {state.subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div key={record.id} className="card bg-bg-light dark:bg-black-soft p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-light dark:bg-gray-mid rounded-ios">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{state.subjects.find(s => s.id === record.subjectId)?.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-light dark:bg-gray-mid rounded-full opacity-60">
                      {record.durationMinutes} min
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-gray-light dark:bg-gray-mid px-2 py-0.5 rounded-full opacity-60">
                      {record.energyPeriod}
                    </span>
                  </div>
                  <div className="text-sm opacity-80 mt-1">{record.topic}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs opacity-60">
                      <Calendar size={12} />
                      {format(parseISO(record.date), "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {getEvaluationIcon(record.evaluation)}
                      <span className="capitalize">{record.evaluation === 'review' ? 'Revisar' : record.evaluation}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:text-right">
                {(record.essayGrade !== undefined || record.mockExamGrade !== undefined) && (
                  <div className="flex flex-col gap-1">
                    {record.essayGrade !== undefined && (
                      <div className="text-xs font-bold">Redação: <span className="text-emerald-500">{record.essayGrade}</span></div>
                    )}
                    {record.mockExamGrade !== undefined && (
                      <div className="text-xs font-bold">Simulado: <span className="text-emerald-500">{record.mockExamGrade}</span></div>
                    )}
                  </div>
                )}
                <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-ios transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Error Bank Display */}
            {record.errors && record.errors.length > 0 && (
              <div className="mt-2 pt-4 border-t border-gray-light dark:border-gray-mid">
                <div className="text-[10px] font-bold uppercase opacity-40 mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Banco de Erros
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.errors.map(error => (
                    <div key={error.id} className="bg-rose-50 dark:bg-rose-950/20 p-2 rounded-ios border border-rose-100 dark:border-rose-900/30">
                      <div className="text-[10px] font-bold uppercase text-rose-600">{error.type}</div>
                      <div className="text-xs opacity-80">{error.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-20 opacity-40 italic">
            Nenhum registro estratégico encontrado.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="text-xl font-bold">Novo Registro Estratégico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Matéria</label>
                  <select 
                    value={newRecord.subjectId}
                    onChange={e => setNewRecord(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  >
                    <option value="">Selecionar Matéria</option>
                    {state.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Tópico Estudado</label>
                  <input 
                    type="text" 
                    value={newRecord.topic}
                    onChange={e => setNewRecord(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                    placeholder="Ex: Revolução Francesa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Data</label>
                    <input 
                      type="date" 
                      value={newRecord.date}
                      onChange={e => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Duração (min)</label>
                    <input 
                      type="number" 
                      value={newRecord.durationMinutes}
                      onChange={e => setNewRecord(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                      className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Período de Energia</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['manhã', 'tarde', 'noite'] as EnergyPeriod[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => setNewRecord(prev => ({ ...prev, energyPeriod: period }))}
                        className={`p-2 rounded-ios border transition-all text-[10px] font-bold uppercase ${
                          newRecord.energyPeriod === period 
                            ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep border-transparent' 
                            : 'border-gray-light dark:border-gray-mid opacity-60'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Banco de Erros (Simulado)</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select 
                        value={newError.type}
                        onChange={e => setNewError(prev => ({ ...prev, type: e.target.value as ErrorType }))}
                        className="bg-bg-ice dark:bg-gray-charcoal p-2 rounded-ios outline-none text-xs"
                      >
                        <option value="conceito">Conceito</option>
                        <option value="interpretação">Interpretação</option>
                        <option value="atenção">Atenção</option>
                      </select>
                      <input 
                        type="text"
                        value={newError.description}
                        onChange={e => setNewError(prev => ({ ...prev, description: e.target.value }))}
                        className="flex-1 bg-bg-ice dark:bg-gray-charcoal p-2 rounded-ios outline-none text-xs"
                        placeholder="Descreva o erro..."
                      />
                      <button 
                        onClick={addErrorToRecord}
                        className="p-2 bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep rounded-ios"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newRecord.errors.map(error => (
                        <div key={error.id} className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2 py-1 rounded-ios border border-rose-100">
                          {error.type}: {error.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Nota Redação</label>
                    <input 
                      type="number" 
                      value={newRecord.essayGrade || ''}
                      onChange={e => setNewRecord(prev => ({ ...prev, essayGrade: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                      placeholder="0-1000"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Nota Simulado</label>
                    <input 
                      type="number" 
                      value={newRecord.mockExamGrade || ''}
                      onChange={e => setNewRecord(prev => ({ ...prev, mockExamGrade: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                      placeholder="0-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Avaliação Pessoal</label>
                  <div className="flex gap-2">
                    {(['good', 'medium', 'review'] as Evaluation[]).map((evalType) => (
                      <button
                        key={evalType}
                        onClick={() => setNewRecord(prev => ({ ...prev, evaluation: evalType }))}
                        className={`flex-1 p-2 rounded-ios border transition-all flex flex-col items-center gap-1 ${
                          newRecord.evaluation === evalType 
                            ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep border-transparent' 
                            : 'border-gray-light dark:border-gray-mid opacity-60'
                        }`}
                      >
                        {getEvaluationIcon(evalType)}
                        <span className="text-[10px] font-bold uppercase">{evalType === 'review' ? 'Revisar' : evalType}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-light dark:border-gray-mid">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleAddRecord} className="btn-primary flex-1">Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
