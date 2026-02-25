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
  Plus,
  Target,
  BarChart2
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'target', label: 'Plano de Prova', icon: Target },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'records', label: 'Registros', icon: BookOpen },
    { id: 'analytics', label: 'Análise', icon: BarChart2 },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'notes', label: 'Notas', icon: StickyNote },
    { id: 'vault', label: 'Cofre', icon: Lock },
    { id: 'subjects', label: 'Matérias', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-ice dark:bg-black-deep text-black-deep dark:text-bg-light font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass z-50 px-4 flex items-center justify-between">
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
      <aside className="fixed left-0 top-16 bottom-0 w-64 hidden lg:flex flex-col p-4 border-r border-gray-light dark:border-gray-mid bg-bg-light dark:bg-black-soft">
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-bg-light dark:bg-black-soft z-[70] p-6 lg:hidden"
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
      <main className="pt-20 pb-24 lg:pl-64 px-4 lg:px-8 max-w-7xl mx-auto">
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
      <nav className="fixed bottom-0 left-0 right-0 h-16 glass lg:hidden flex items-center overflow-x-auto no-scrollbar px-4 z-50 snap-x">
        <div className="flex items-center gap-6 min-w-max mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all snap-center ${
                activeTab === item.id ? 'text-black-deep dark:text-bg-light scale-110' : 'opacity-40'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
