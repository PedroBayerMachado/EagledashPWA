import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  History,
  TrendingUp,
  Clock,
  Activity,
  Award,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { AppState, PomodoroSession } from '../types';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface PomodoroProps {
  state: AppState;
  onAddSession: (session: PomodoroSession) => void;
}

export default function Pomodoro({ state, onAddSession }: PomodoroProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [cycles, setCycles] = useState(0);
  const [config, setConfig] = useState({ focus: 25, break: 5 });
  const [showSettings, setShowSettings] = useState(false);
  const [isGlobalFocus, setIsGlobalFocus] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setCycles(prev => prev + 1);
      setMode('break');
      setTimeLeft(config.break * 60);
    } else {
      setMode('focus');
      setTimeLeft(config.focus * 60);
      
      const session: PomodoroSession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        focusTime: config.focus,
        breakTime: config.break,
        cycles: 1
      };
      onAddSession(session);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setTimeLeft(config.focus * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((config.focus * 60 - timeLeft) / (config.focus * 60)) * 100
    : ((config.break * 60 - timeLeft) / (config.break * 60)) * 100;

  // Advanced Focus Report
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const weeklySessions = state.pomodoroHistory.filter(s => 
    isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
  );

  const totalFocusMinutes = weeklySessions.reduce((acc, s) => acc + s.focusTime, 0);
  const avgSessionTime = weeklySessions.length > 0 ? totalFocusMinutes / weeklySessions.length : 0;
  const focusConsistency = Math.min(100, (weeklySessions.length / 10) * 100); // Base 10 sessions/week

  return (
    <div className={`space-y-8 ${isGlobalFocus ? 'fixed inset-0 z-[200] bg-bg-light dark:bg-black-deep flex flex-col items-center justify-center p-8' : ''}`}>
      {isGlobalFocus && (
        <button 
          onClick={() => setIsGlobalFocus(false)}
          className="absolute top-8 right-8 p-4 hover:bg-gray-light dark:hover:bg-gray-mid rounded-full transition-all"
        >
          <Minimize2 size={24} />
        </button>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto ${isGlobalFocus ? 'items-center justify-center' : ''}`}>
        {/* Timer Column */}
        <div className={`flex-1 flex flex-col items-center justify-center space-y-8 ${isGlobalFocus ? '' : 'py-12'}`}>
          <div className={`relative flex items-center justify-center ${isGlobalFocus ? 'w-80 h-80 md:w-[500px] md:h-[500px]' : 'w-64 h-64 md:w-80 md:h-80'}`}>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth={isGlobalFocus ? "2" : "4"}
                className="opacity-10"
              />
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth={isGlobalFocus ? "2" : "4"}
                strokeDasharray="301.59"
                strokeDashoffset={301.59 - (301.59 * progress) / 100}
                className="transition-all duration-1000"
              />
            </svg>
            
            <div className="text-center z-10">
              <div className={`text-sm font-bold uppercase tracking-widest opacity-40 mb-2 ${isGlobalFocus ? 'text-lg' : ''}`}>
                {mode === 'focus' ? 'Foco Estratégico' : 'Recuperação'}
              </div>
              <div className={`font-bold tracking-tighter tabular-nums ${isGlobalFocus ? 'text-8xl md:text-[12rem]' : 'text-6xl md:text-7xl'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className={`text-sm opacity-60 mt-2 ${isGlobalFocus ? 'text-base' : ''}`}>Ciclo #{cycles + 1}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="p-4 hover:bg-gray-light dark:hover:bg-gray-mid rounded-full transition-all"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={toggleTimer}
              className={`${isGlobalFocus ? 'w-32 h-32' : 'w-20 h-20'} bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all`}
            >
              {isActive ? <Pause size={isGlobalFocus ? 48 : 32} fill="currentColor" /> : <Play size={isGlobalFocus ? 48 : 32} fill="currentColor" className="ml-1" />}
            </button>
            {!isGlobalFocus ? (
              <button 
                onClick={() => setShowSettings(true)}
                className="p-4 hover:bg-gray-light dark:hover:bg-gray-mid rounded-full transition-all"
              >
                <Settings size={24} />
              </button>
            ) : null}
            <button 
              onClick={() => setIsGlobalFocus(!isGlobalFocus)}
              className="p-4 hover:bg-gray-light dark:hover:bg-gray-mid rounded-full transition-all"
            >
              {isGlobalFocus ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
        </div>

        {/* Advanced Reports Column */}
        {!isGlobalFocus && (
          <div className="w-full lg:w-96 space-y-6">
            <div className="card bg-bg-light dark:bg-black-soft">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity size={20} />
                Relatório de Foco
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
                  <div className="text-[10px] opacity-40 uppercase font-bold mb-1">Tempo Médio</div>
                  <div className="text-xl font-bold">{avgSessionTime.toFixed(0)}m</div>
                </div>
                <div className="p-4 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
                  <div className="text-[10px] opacity-40 uppercase font-bold mb-1">Consistência</div>
                  <div className="text-xl font-bold">{focusConsistency.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div className="card bg-bg-light dark:bg-black-soft">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History size={20} />
                Histórico Estratégico
              </h3>
              <div className="space-y-3">
                {state.pomodoroHistory.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-ios bg-bg-ice dark:bg-gray-charcoal">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{session.focusTime}m Foco</div>
                        <div className="text-[10px] opacity-40">{format(new Date(session.date), 'dd/MM HH:mm')}</div>
                      </div>
                    </div>
                    <Award size={16} className="text-amber-500" />
                  </div>
                ))}
                {state.pomodoroHistory.length === 0 && (
                  <div className="text-center py-8 opacity-40 italic">Nenhuma sessão estratégica.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-sm space-y-6">
            <h3 className="text-xl font-bold">Configurações de Foco</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-2 block">Tempo de Foco (min)</label>
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="5"
                  value={config.focus}
                  onChange={e => setConfig(prev => ({ ...prev, focus: parseInt(e.target.value) }))}
                  className="w-full accent-black-deep dark:accent-bg-light"
                />
                <div className="text-center font-bold mt-1">{config.focus} min</div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-2 block">Tempo de Intervalo (min)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1"
                  value={config.break}
                  onChange={e => setConfig(prev => ({ ...prev, break: parseInt(e.target.value) }))}
                  className="w-full accent-black-deep dark:accent-bg-light"
                />
                <div className="text-center font-bold mt-1">{config.break} min</div>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowSettings(false);
                resetTimer();
              }}
              className="btn-primary w-full"
            >
              Salvar e Reiniciar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
