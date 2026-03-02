import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Search, 
  ShieldCheck, 
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { AppState, PasswordEntry } from '../types';
import { encryptData, decryptData } from '../utils/crypto';

interface VaultProps {
  state: AppState;
  onAddPassword: (entry: PasswordEntry) => void;
  onSetPin: (pin: string) => void;
}

export default function Vault({ state, onAddPassword, onSetPin }: VaultProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  
  const [newEntry, setNewEntry] = useState({
    platform: '',
    email: '',
    password: '',
    notes: ''
  });

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isLocked) {
      timeout = setTimeout(() => setIsLocked(true), 5 * 60 * 1000);
    }
    return () => clearTimeout(timeout);
  }, [isLocked]);

  const handleUnlock = () => {
    if (pinInput === state.vaultPin) {
      setIsLocked(false);
      setPinInput('');
      setError('');
    } else {
      setError('PIN Incorreto');
    }
  };

  const handleSetPin = () => {
    if (pinInput.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos');
      return;
    }
    onSetPin(pinInput);
    setIsLocked(false);
    setPinInput('');
    setError('');
  };

  const filteredPasswords = state.passwords.filter(p => 
    p.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = async (entry: PasswordEntry) => {
    if (visiblePasswords[entry.id]) {
      setVisiblePasswords(prev => ({ ...prev, [entry.id]: false }));
      return;
    }

    try {
      if (!decryptedPasswords[entry.id] && entry.iv && state.vaultPin) {
        const decrypted = await decryptData(entry.password, entry.iv, state.vaultPin);
        setDecryptedPasswords(prev => ({ ...prev, [entry.id]: decrypted }));
      }
      setVisiblePasswords(prev => ({ ...prev, [entry.id]: true }));
    } catch (e) {
      setError('Erro ao descriptografar');
    }
  };

  const copyToClipboard = async (entry: PasswordEntry) => {
    try {
      let text = entry.password;
      if (entry.iv && state.vaultPin) {
        text = await decryptData(entry.password, entry.iv, state.vaultPin);
      }
      navigator.clipboard.writeText(text);
      // In a real app, show a toast here
    } catch (e) {
      setError('Erro ao copiar');
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.platform || !newEntry.password) return;
    
    try {
      let passwordToStore = newEntry.password;
      let iv: string | undefined;

      if (state.vaultPin) {
        const encrypted = await encryptData(newEntry.password, state.vaultPin);
        passwordToStore = encrypted.encrypted;
        iv = encrypted.iv;
      }

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        platform: newEntry.platform,
        email: newEntry.email,
        password: passwordToStore,
        notes: newEntry.notes,
        iv
      };
      
      onAddPassword(entry);
      setShowModal(false);
      setNewEntry({ platform: '', email: '', password: '', notes: '' });
    } catch (e) {
      setError('Erro ao salvar senha');
    }
  };

  if (!state.vaultPin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-6 bg-gray-light dark:bg-black-soft rounded-full">
          <Key size={48} className="opacity-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Configurar Cofre</h2>
          <p className="opacity-60 mb-6">Defina um PIN de segurança para criptografar suas senhas localmente.</p>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Digite seu novo PIN"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className="w-full bg-bg-light dark:bg-black-soft p-4 rounded-ios border border-gray-light dark:border-gray-mid text-center text-2xl tracking-widest"
            />
            {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
            <button onClick={handleSetPin} className="btn-primary w-full">Configurar PIN</button>
          </div>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-6 bg-gray-light dark:bg-black-soft rounded-full">
          <Lock size={48} className="opacity-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Cofre Bloqueado</h2>
          <p className="opacity-60 mb-6">Insira seu PIN para acessar suas credenciais criptografadas.</p>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="PIN"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className="w-full bg-bg-light dark:bg-black-soft p-4 rounded-ios border border-gray-light dark:border-gray-mid text-center text-2xl tracking-widest"
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            />
            {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
            <button onClick={handleUnlock} className="btn-primary w-full">Desbloquear</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Cofre de Senhas</h2>
            <button onClick={() => setIsLocked(true)} className="p-1 opacity-40 hover:opacity-100">
              <Unlock size={16} />
            </button>
          </div>
          <p className="opacity-60">Armazenamento local seguro com criptografia AES-256.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          Nova Senha
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
        <input 
          type="text" 
          placeholder="Buscar plataforma ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-bg-light dark:bg-black-soft p-4 pl-12 rounded-ios-lg outline-none border border-gray-light dark:border-gray-mid focus:ring-2 ring-black-deep/10 dark:ring-bg-light/10"
        />
      </div>

      {/* Password List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPasswords.map((entry) => (
          <div key={entry.id} className="card bg-bg-light dark:bg-black-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-light dark:bg-gray-mid rounded-ios">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold">{entry.platform}</h3>
              </div>
              <button className="p-1 opacity-40 hover:opacity-100">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase opacity-40 block mb-1">Email / Usuário</label>
                <div className="flex items-center justify-between bg-bg-ice dark:bg-gray-charcoal p-2 rounded-ios">
                  <span className="text-sm truncate mr-2">{entry.email}</span>
                  <button onClick={() => navigator.clipboard.writeText(entry.email)} className="p-1 hover:bg-gray-light dark:hover:bg-gray-mid rounded">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase opacity-40 block mb-1">Senha</label>
                <div className="flex items-center justify-between bg-bg-ice dark:bg-gray-charcoal p-2 rounded-ios">
                  <span className="text-sm font-mono">
                    {visiblePasswords[entry.id] ? (decryptedPasswords[entry.id] || '...') : '••••••••••••'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => togglePasswordVisibility(entry) } className="p-1 hover:bg-gray-light dark:hover:bg-gray-mid rounded">
                      {visiblePasswords[entry.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => copyToClipboard(entry)} className="p-1 hover:bg-gray-light dark:hover:bg-gray-mid rounded">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {entry.notes && (
              <p className="text-xs opacity-60 italic line-clamp-2">{entry.notes}</p>
            )}
          </div>
        ))}
        
        {filteredPasswords.length === 0 && (
          <div className="col-span-full text-center py-20 opacity-40 italic">
            Nenhuma senha encontrada.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card bg-bg-light dark:bg-black-soft w-full max-w-md space-y-6">
            <h3 className="text-xl font-bold">Adicionar Credencial</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Plataforma</label>
                <input 
                  type="text" 
                  value={newEntry.platform}
                  onChange={e => setNewEntry(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="Ex: Gmail, LinkedIn..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Email / Usuário</label>
                <input 
                  type="text" 
                  value={newEntry.email}
                  onChange={e => setNewEntry(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="seuemail@exemplo.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Senha</label>
                <input 
                  type="password" 
                  value={newEntry.password}
                  onChange={e => setNewEntry(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Observações</label>
                <textarea 
                  value={newEntry.notes}
                  onChange={e => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-bg-ice dark:bg-gray-charcoal p-3 rounded-ios outline-none h-24 resize-none"
                  placeholder="Dicas de recuperação, etc..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleAddEntry} className="btn-primary flex-1">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
