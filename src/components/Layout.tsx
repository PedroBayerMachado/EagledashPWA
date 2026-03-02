import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Timer, 
  Lock, 
  StickyNote, 
  Settings,
  Menu,
  X,
  Target,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { state, toggleTheme } = useAppState();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // 🔥 Adicionado: trava o scroll do fundo quando o menu estiver aberto
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'records', label: 'Registros', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'recursos', label: 'Recursos', icon: Sparkles },
    { id: 'target', label: 'Plano de Prova', icon: Target },
    { id: 'analytics', label: 'Análise', icon: BarChart2 },
    { id: 'notes', label: 'Notas', icon: StickyNote },
    { id: 'vault', label: 'Cofre', icon: Lock },
    { id: 'subjects', label: 'Matérias', icon: Settings },
  ];

  const bottomMenuItems = menuItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-ice dark:bg-black-deep text-black-deep dark:text-bg-light font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-top))] glass z-50 px-4 flex items-end pb-4 lg:items-center lg:pb-0 justify-between pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded-ios lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Eagledash</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle removed per user request */}
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 w-64 hidden lg:flex flex-col p-4 border-r border-gray-light dark:border-gray-mid bg-bg-light dark:bg-black-soft">
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-ios transition-all ${
                activeTab === item.id 
                  ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep shadow-md' 
                  : 'hover:bg-gray-light dark:hover:bg-gray-mid opacity-70 hover:opacity-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-bg-light dark:bg-black-soft z-[70] p-6 lg:hidden pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-ios transition-all ${
                      activeTab === item.id 
                        ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep' 
                        : 'hover:bg-gray-light dark:hover:bg-gray-mid'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="text-lg font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pt-24 lg:pb-8 lg:pl-64 px-4 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[calc(4.5rem+env(safe-area-inset-bottom))] glass lg:hidden flex items-center justify-around px-2 z-[100] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {bottomMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative ${
              activeTab === item.id 
                ? 'text-black-deep dark:text-bg-light' 
                : 'opacity-30 hover:opacity-50'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div 
              animate={activeTab === item.id ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
              className={`p-1.5 rounded-ios transition-colors ${activeTab === item.id ? 'bg-black-deep/5 dark:bg-white/10' : ''}`}
            >
              <item.icon size={26} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </motion.div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute -top-0.5 w-10 h-1 bg-black-deep dark:bg-bg-light rounded-full"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}