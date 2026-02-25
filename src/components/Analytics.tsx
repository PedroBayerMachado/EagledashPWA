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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Target,
  Brain,
  Search,
  Filter
} from 'lucide-react';
import { AppState, ErrorType, EnergyPeriod } from '../types';

interface AnalyticsProps {
  state: AppState;
}

export default function Analytics({ state }: AnalyticsProps) {
  // Error Analysis
  const allErrors = state.records.flatMap(r => r.errors || []);
  const errorTypeData = (['conceito', 'interpretação', 'atenção'] as ErrorType[]).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: allErrors.filter(e => e.type === type).length
  }));

  const COLORS = ['#121214', '#E6E6E6', '#808080'];

  // Energy Analysis
  const energyData = (['manhã', 'tarde', 'noite'] as EnergyPeriod[]).map(period => {
    const periodRecords = state.records.filter(r => r.energyPeriod === period);
    const totalMinutes = periodRecords.reduce((acc, r) => acc + r.durationMinutes, 0);
    const avgGrade = periodRecords.length > 0
      ? periodRecords.reduce((acc, r) => acc + (r.mockExamGrade || 0), 0) / (periodRecords.filter(r => r.mockExamGrade).length || 1)
      : 0;
    
    return {
      name: period.charAt(0).toUpperCase() + period.slice(1),
      horas: totalMinutes / 60,
      desempenho: avgGrade
    };
  });

  // Subject Gap Analysis
  const subjectGapData = state.subjects.map(subject => {
    const subjectRecords = state.records.filter(r => r.subjectId === subject.id);
    const errorCount = subjectRecords.reduce((acc, r) => acc + (r.errors?.length || 0), 0);
    const avgGrade = subjectRecords.length > 0
      ? subjectRecords.reduce((acc, r) => acc + (r.mockExamGrade || 0), 0) / (subjectRecords.filter(r => r.mockExamGrade).length || 1)
      : 0;
    
    return {
      subject: subject.name,
      erros: errorCount,
      nota: avgGrade,
      fullMark: 100
    };
  }).filter(s => s.erros > 0 || s.nota > 0).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise Estratégica</h2>
          <p className="opacity-60">Relatórios detalhados de erros e produtividade.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Bank Report */}
        <div className="card bg-bg-light dark:bg-black-soft">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            Distribuição de Erros
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {errorTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {errorTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm font-medium opacity-70">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Energy vs Performance */}
        <div className="card bg-bg-light dark:bg-black-soft">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap size={20} className="text-emerald-500" />
            Energia vs Desempenho
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6E6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#121214" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#808080" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="horas" name="Horas Estudadas" fill="#121214" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="desempenho" name="Nota Média" fill="#E6E6E6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Gap Radar */}
        <div className="card bg-bg-light dark:bg-black-soft lg:col-span-2">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Brain size={20} className="text-indigo-500" />
            Mapeamento de Lacunas por Matéria
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectGapData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Nota Média"
                  dataKey="nota"
                  stroke="#121214"
                  fill="#121214"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Erros Acumulados"
                  dataKey="erros"
                  stroke="#rose-500"
                  fill="#rose-500"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="space-y-6">
          <div className="card bg-bg-light dark:bg-black-soft">
            <h3 className="text-lg font-bold mb-4">Top 3 Lacunas</h3>
            <div className="space-y-4">
              {subjectGapData.sort((a, b) => a.erros - b.erros).slice(0, 3).map((gap, idx) => (
                <div key={gap.subject} className="flex items-center justify-between p-3 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold opacity-40">0{idx + 1}</span>
                    <span className="text-sm font-medium">{gap.subject}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-500">{gap.erros} erros</div>
                    <div className="text-[10px] opacity-40">Nota: {gap.nota.toFixed(0)}</div>
                  </div>
                </div>
              ))}
              {subjectGapData.length === 0 && (
                <div className="text-center py-8 opacity-40 italic">Sem dados suficientes.</div>
              )}
            </div>
          </div>

          <div className="card bg-black-deep text-bg-light">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target size={20} />
              Foco Recomendado
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Com base no volume de erros de <span className="font-bold">Interpretação</span>, sugerimos aumentar o tempo de leitura ativa e simulados de Humanas no período da <span className="font-bold">Manhã</span>.
            </p>
            <button className="w-full mt-6 py-3 bg-bg-light text-black-deep rounded-ios font-bold text-sm">
              Ver Plano de Ação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
