import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronRight,
  Plus,
  ShieldAlert,
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import { AppState } from '../types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  parseISO, 
  isSameDay, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  differenceInDays
} from 'date-fns';

interface DashboardProps {
  state: AppState;
  onAddRecord: () => void;
  onUpdateGoals: (goals: AppState['goals']) => void;
}

export default function Dashboard({ state, onAddRecord, onUpdateGoals }: DashboardProps) {
  const now = new Date();
  
  // Weekly Calculations
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const prevWeekStart = startOfWeek(subWeeks(now, 1));
  const prevWeekEnd = endOfWeek(subWeeks(now, 1));

  const weeklyRecords = state.records.filter(r => 
    isWithinInterval(parseISO(r.date), { start: weekStart, end: weekEnd })
  );
  const prevWeeklyRecords = state.records.filter(r => 
    isWithinInterval(parseISO(r.date), { start: prevWeekStart, end: prevWeekEnd })
  );

  const totalHours = weeklyRecords.reduce((acc, r) => acc + (r.durationMinutes / 60), 0);
  const prevTotalHours = prevWeeklyRecords.reduce((acc, r) => acc + (r.durationMinutes / 60), 0);
  const hoursDiff = totalHours - prevTotalHours;

  // Monthly Calculations
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const monthlyRecords = state.records.filter(r => 
    isWithinInterval(parseISO(r.date), { start: monthStart, end: monthEnd })
  );
  const prevMonthlyRecords = state.records.filter(r => 
    isWithinInterval(parseISO(r.date), { start: prevMonthStart, end: prevMonthEnd })
  );

  const monthlyHours = monthlyRecords.reduce((acc, r) => acc + (r.durationMinutes / 60), 0);
  const prevMonthlyHours = prevMonthlyRecords.reduce((acc, r) => acc + (r.durationMinutes / 60), 0);

  // Equilibrium
  const exatasHours = weeklyRecords
    .filter(r => state.subjects.find(s => s.id === r.subjectId)?.category === 'exatas')
    .reduce((acc, r) => acc + (r.durationMinutes / 60), 0);
  const humanasHours = weeklyRecords
    .filter(r => state.subjects.find(s => s.id === r.subjectId)?.category === 'humanas')
    .reduce((acc, r) => acc + (r.durationMinutes / 60), 0);

  // Recovery Mode
  const lastStudyDate = state.records.length > 0 ? parseISO(state.records[0].date) : null;
  const daysSinceLastStudy = lastStudyDate ? differenceInDays(now, lastStudyDate) : 999;
  const isRecoveryMode = daysSinceLastStudy >= 3 && !state.goals.isRecoveryActive;

  const currentWeeklyGoal = state.goals.isRecoveryActive 
    ? state.goals.weeklyHours * 0.5 
    : state.goals.weeklyHours;

  // Performance Score (0-100)
  // Formula: (Hours/Meta * 30) + (AvgGrade * 30) + (Constancy * 20) + (CognitiveBalance * 20)
  const avgGrade = monthlyRecords.length > 0 
    ? monthlyRecords.reduce((acc, r) => acc + (r.mockExamGrade || 0), 0) / (monthlyRecords.filter(r => r.mockExamGrade).length || 1)
    : 0;
  
  const daysStudiedMonth = new Set(monthlyRecords.map(r => format(parseISO(r.date), 'yyyy-MM-dd'))).size;
  const constancy = (daysStudiedMonth / 30) * 100;

  // Cognitive Balance (0-100)
  // Ideal: 50/50 split between Exatas and Humanas
  const totalCategoryHours = exatasHours + humanasHours;
  const balanceScore = totalCategoryHours > 0 
    ? (1 - Math.abs(exatasHours / totalCategoryHours - 0.5) * 2) * 100 
    : 0;
  
  const performanceScore = Math.min(100, 
    (currentWeeklyGoal > 0 ? Math.min(1, totalHours / currentWeeklyGoal) * 30 : 0) + 
    (avgGrade * 0.3) + 
    (constancy * 0.2) +
    (balanceScore * 0.2)
  );

  // Classification
  let classification = 'Irregular';
  if (performanceScore > 85) classification = 'Alta Performance';
  else if (performanceScore > 70) classification = 'Consistente';
  else if (performanceScore > 50) classification = 'Estável';

  // Projections
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const daysPassed = differenceInDays(now, monthStart) + 1;
  const projectedMonthlyHours = (monthlyHours / Math.max(1, daysPassed)) * daysInMonth;

  // Result Projection (Mathematical trend)
  // Based on average grade and hours trend
  const gradeTrend = avgGrade > 0 ? (avgGrade * (1 + (hoursDiff / Math.max(1, totalHours)) * 0.1)) : 0;

  // Streak
  const studyDates = new Set(state.records.map(r => format(parseISO(r.date), 'yyyy-MM-dd')));
  let streak = 0;
  let checkDate = new Date();
  while (studyDates.has(format(checkDate, 'yyyy-MM-dd'))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Gap Diagnosis (Diagnóstico de Lacunas)
  const subjectPerformance = state.subjects.map(subject => {
    const subjectRecords = state.records.filter(r => r.subjectId === subject.id);
    const avgSubjectGrade = subjectRecords.length > 0
      ? subjectRecords.reduce((acc, r) => acc + (r.mockExamGrade || 0), 0) / (subjectRecords.filter(r => r.mockExamGrade).length || 1)
      : null;
    const errorCount = subjectRecords.reduce((acc, r) => acc + (r.errors?.length || 0), 0);
    return { subject, avgSubjectGrade, errorCount, recordCount: subjectRecords.length };
  });

  const criticalSubjects = subjectPerformance
    .filter(sp => sp.recordCount > 0 && (sp.avgSubjectGrade !== null && sp.avgSubjectGrade < 60 || sp.errorCount > 3))
    .sort((a, b) => (a.avgSubjectGrade || 100) - (b.avgSubjectGrade || 100));

  const distributionData = [
    { name: 'Exatas', value: exatasHours || 0.01, color: '#121214' },
    { name: 'Humanas', value: humanasHours || 0.01, color: '#E6E6E6' },
  ];

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const performanceData = days.map((day, index) => {
    const dayDate = startOfWeek(now);
    dayDate.setDate(dayDate.getDate() + index);
    const dayRecords = state.records.filter(r => isSameDay(parseISO(r.date), dayDate));
    const hours = dayRecords.reduce((acc, r) => acc + (r.durationMinutes / 60), 0);
    return { name: day, hours };
  });

  const pendingReviews = state.records.filter(r => r.evaluation === 'review').length;

  return (
    <div className="space-y-8">
      {/* Recovery Alert */}
      {isRecoveryMode && state.records.length > 0 && (
        <div className="p-4 rounded-ios bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShieldAlert className="text-rose-500" size={24} />
            <div>
              <div className="font-bold text-rose-700 dark:text-rose-400">Modo Recuperação Detectado</div>
              <p className="text-sm text-rose-600 dark:text-rose-500/80">Você está há {daysSinceLastStudy} dias sem estudar. Ative o plano de retomada.</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdateGoals({ ...state.goals, isRecoveryActive: true })}
            className="px-4 py-2 bg-rose-500 text-white rounded-ios text-sm font-bold hover:bg-rose-600 transition-colors"
          >
            Ativar Plano
          </button>
        </div>
      )}

      {state.goals.isRecoveryActive && (
        <div className="p-4 rounded-ios bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Zap className="text-emerald-500" size={24} />
            <div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">Plano de Retomada Ativo</div>
              <p className="text-sm text-emerald-600 dark:text-emerald-500/80">Meta semanal reduzida em 50% para facilitar sua volta aos estudos.</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdateGoals({ ...state.goals, isRecoveryActive: false })}
            className="px-4 py-2 bg-emerald-500 text-white rounded-ios text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            Finalizar Plano
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Eagledash Performance</h2>
          <p className="opacity-60">Análise estratégica de desempenho acadêmico.</p>
        </div>
        <button 
          onClick={onAddRecord}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      {/* Strategic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-bg-light dark:bg-black-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
              <Award size={20} />
            </div>
            <span className="text-sm font-medium opacity-60">Score Performance</span>
          </div>
          <div className="text-2xl font-bold">{performanceScore.toFixed(0)}/100</div>
          <div className="text-xs mt-1 font-medium opacity-60">{classification}</div>
        </div>

        <div className="card bg-bg-light dark:bg-black-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
              <Activity size={20} />
            </div>
            <span className="text-sm font-medium opacity-60">Regularidade (30d)</span>
          </div>
          <div className="text-2xl font-bold">{constancy.toFixed(0)}%</div>
          <div className="text-xs mt-1 opacity-60">{daysStudiedMonth} dias ativos</div>
        </div>

        <div className="card bg-bg-light dark:bg-black-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
              <Clock size={20} />
            </div>
            <span className="text-sm font-medium opacity-60">Projeção Mensal</span>
          </div>
          <div className="text-2xl font-bold">{projectedMonthlyHours.toFixed(1)}h</div>
          <div className="text-xs mt-1 opacity-60">Tendência de ritmo</div>
        </div>

        <div className="card bg-bg-light dark:bg-black-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
              <Target size={20} />
            </div>
            <span className="text-sm font-medium opacity-60">Revisões</span>
          </div>
          <div className="text-2xl font-bold">{pendingReviews} pendentes</div>
          <div className="text-xs mt-1 text-amber-500 font-medium">{pendingReviews > 5 ? 'Urgente' : 'Em dia'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-bg-light dark:bg-black-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Carga Horária Semanal</h3>
            <div className="text-xs font-bold uppercase opacity-40">
              {hoursDiff >= 0 ? '+' : ''}{hoursDiff.toFixed(1)}h vs semana anterior
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6E6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.6 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.6 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="#121214" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-bg-light dark:bg-black-soft">
          <h3 className="text-lg font-bold mb-6">Equilíbrio Cognitivo</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium opacity-70">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-bg-light dark:bg-black-soft">
          <h3 className="text-lg font-bold mb-6">Análise de Tendência</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-ios">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm font-medium">Projeção de Nota</span>
              </div>
              <span className="font-bold text-emerald-600">{gradeTrend.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-ios">
                  <Zap size={16} />
                </div>
                <span className="text-sm font-medium">Consistência de Foco</span>
              </div>
              <span className="font-bold text-amber-600">Estável</span>
            </div>
          </div>
        </div>

        <div className="card bg-bg-light dark:bg-black-soft">
          <h3 className="text-lg font-bold mb-6">Diagnóstico de Lacunas</h3>
          <div className="space-y-3">
            {state.records.length === 0 ? (
              <div className="text-center py-8 opacity-40 italic">Aguardando dados para diagnóstico...</div>
            ) : criticalSubjects.length > 0 ? (
              <div className="space-y-2">
                {criticalSubjects.slice(0, 3).map(cs => (
                  <div key={cs.subject.id} className="p-3 rounded-ios bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-rose-700 dark:text-rose-400">{cs.subject.name}</div>
                      <div className="text-[10px] opacity-60">Risco: {cs.avgSubjectGrade !== null && cs.avgSubjectGrade < 50 ? 'Crítico' : 'Moderado'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-600">{cs.errorCount} erros</div>
                      <div className="text-[10px] opacity-60">Nota: {cs.avgSubjectGrade?.toFixed(0) || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-ios bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">Desempenho Estável</div>
                <p className="text-sm text-emerald-600 dark:text-emerald-500/80">Nenhuma lacuna crítica detectada no momento. Mantenha o ritmo!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
