import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Timer, 
  StickyNote, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  BookOpen, 
  Zap, 
  Smartphone, 
  WifiOff, 
  Bell, 
  Cpu,
  Lock,
  LineChart
} from 'lucide-react';
import { motion } from 'motion/react';

const resources = [
  {
    category: "Gestão & Planejamento",
    items: [
      {
        icon: LayoutDashboard,
        name: "Dashboard Estratégico",
        description: "Visão 360º do seu desempenho com métricas de performance e score em tempo real.",
        color: "bg-blue-500/10 text-blue-600"
      },
      {
        icon: Calendar,
        name: "Agenda Inteligente",
        description: "Organize suas tarefas com cálculo de carga cognitiva para evitar burnout.",
        color: "bg-purple-500/10 text-purple-600"
      },
      {
        icon: Target,
        name: "Plano de Prova",
        description: "Defina sua meta-alvo e acompanhe a contagem regressiva com projeções matemáticas.",
        color: "bg-rose-500/10 text-rose-600"
      }
    ]
  },
  {
    category: "Execução & Estudo",
    items: [
      {
        icon: ClipboardList,
        name: "Registros Estratégicos",
        description: "Banco de erros e análise de energia por período para identificar lacunas.",
        color: "bg-emerald-500/10 text-emerald-600"
      },
      {
        icon: Timer,
        name: "Pomodoro de Alta Performance",
        description: "Timer customizável com modo foco imersivo e histórico de ciclos.",
        color: "bg-orange-500/10 text-orange-600"
      },
      {
        icon: StickyNote,
        name: "Bloco de Notas",
        description: "Editor de texto organizado por pastas para resumos e insights rápidos.",
        color: "bg-amber-500/10 text-amber-600"
      }
    ]
  },
  {
    category: "Análise & Inteligência",
    items: [
      {
        icon: BarChart3,
        name: "Analytics Avançado",
        description: "Gráficos detalhados de distribuição de carga e evolução de notas.",
        color: "bg-indigo-500/10 text-indigo-600"
      },
      {
        icon: BookOpen,
        name: "Gestão de Matérias",
        description: "Controle de pesos e categorias para equilibrar seu estudo.",
        color: "bg-cyan-500/10 text-cyan-600"
      },
      {
        icon: Zap,
        name: "Modo Recuperação",
        description: "Plano de retomada automático após períodos de inatividade.",
        color: "bg-yellow-500/10 text-yellow-600"
      }
    ]
  },
  {
    category: "Tecnologia & Segurança",
    items: [
      {
        icon: Lock,
        name: "Cofre de Senhas",
        description: "Armazenamento local seguro com criptografia AES-256 para suas credenciais.",
        color: "bg-slate-500/10 text-slate-600"
      },
      {
        icon: Smartphone,
        name: "PWA Nativo",
        description: "Instale como um aplicativo no seu celular com suporte a safe-areas.",
        color: "bg-zinc-500/10 text-zinc-600"
      },
      {
        icon: WifiOff,
        name: "Funcionamento Offline",
        description: "Acesse e gerencie seus dados mesmo sem conexão com a internet.",
        color: "bg-sky-500/10 text-sky-600"
      }
    ]
  }
];

export default function Resources({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Tudo que a plataforma <br />
            <span className="text-black-deep dark:text-bg-light opacity-40">oferece para você</span>
          </h1>
          <p className="text-lg opacity-60 max-w-2xl mx-auto mt-4">
            Uma suíte completa de ferramentas estratégicas desenhadas para elevar seu desempenho acadêmico e organizar sua rotina de estudos.
          </p>
        </motion.div>
      </section>

      {/* Resources Grid */}
      <div className="space-y-16">
        {resources.map((category, catIdx) => (
          <div key={category.category} className="space-y-6">
            <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest px-4">
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card bg-bg-light dark:bg-black-soft hover:shadow-xl transition-all group"
                >
                  <div className={`w-12 h-12 rounded-ios ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <p className="text-sm opacity-60 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <section className="py-12 text-center">
        <div className="card bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep p-8 md:p-12">
          <Cpu className="mx-auto mb-6 opacity-40" size={48} />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="opacity-60 mb-8 max-w-md mx-auto">
            Explore cada recurso e transforme sua forma de estudar com o Eagledash.
          </p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-bg-light text-black-deep dark:bg-black-deep dark:text-bg-light rounded-ios font-bold hover:scale-105 transition-transform"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
