import React, { useState } from 'react';
import { 
  FolderPlus, 
  FilePlus, 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Search,
  MoreVertical,
  Type,
  Bold,
  Italic,
  Save,
  Trash2
} from 'lucide-react';
import { AppState, NoteFolder, NoteBlock } from '../types';
import { format } from 'date-fns';

interface NotesProps {
  state: AppState;
  onUpdateFolders: (folders: NoteFolder[]) => void;
}

export default function Notes({ state, onUpdateFolders }: NotesProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const selectedFolder = state.noteFolders.find(f => f.id === selectedFolderId);
  const selectedBlock = selectedFolder?.blocks.find(b => b.id === selectedBlockId);

  const handleAddFolder = () => {
    const name = prompt('Nome da pasta:');
    if (!name) return;
    
    const newFolder: NoteFolder = {
      id: crypto.randomUUID(),
      name,
      blocks: []
    };
    
    onUpdateFolders([...state.noteFolders, newFolder]);
  };

  const handleAddBlock = (folderId: string) => {
    const title = prompt('Título da nota:');
    if (!title) return;
    
    const newBlock: NoteBlock = {
      id: crypto.randomUUID(),
      title,
      content: '',
      lastModified: new Date().toISOString(),
      fontSize: 16
    };
    
    const updatedFolders = state.noteFolders.map(f => {
      if (f.id === folderId) {
        return { ...f, blocks: [...f.blocks, newBlock] };
      }
      return f;
    });
    
    onUpdateFolders(updatedFolders);
    setSelectedFolderId(folderId);
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (content: string) => {
    if (!selectedFolderId || !selectedBlockId) return;
    
    const updatedFolders = state.noteFolders.map(f => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          blocks: f.blocks.map(b => {
            if (b.id === selectedBlockId) {
              return { ...b, content, lastModified: new Date().toISOString() };
            }
            return b;
          })
        };
      }
      return f;
    });
    
    onUpdateFolders(updatedFolders);
  };

  const handleUpdateFontSize = (size: number) => {
    if (!selectedFolderId || !selectedBlockId) return;
    
    const updatedFolders = state.noteFolders.map(f => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          blocks: f.blocks.map(b => {
            if (b.id === selectedBlockId) {
              return { ...b, fontSize: size };
            }
            return b;
          })
        };
      }
      return f;
    });
    
    onUpdateFolders(updatedFolders);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar - Folders & Notes */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notas</h2>
          <button 
            onClick={handleAddFolder}
            className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded-ios"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
          <input 
            type="text" 
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-bg-light dark:bg-black-soft p-2 pl-10 rounded-ios outline-none border border-gray-light dark:border-gray-mid text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {state.noteFolders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              <div 
                className={`flex items-center justify-between p-2 rounded-ios cursor-pointer transition-colors ${selectedFolderId === folder.id ? 'bg-gray-light dark:bg-gray-mid' : 'hover:bg-gray-light/50 dark:hover:bg-gray-mid/50'}`}
                onClick={() => setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)}
              >
                <div className="flex items-center gap-2">
                  {selectedFolderId === folder.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Folder size={18} className="text-amber-500" />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAddBlock(folder.id); }}
                  className="p-1 hover:bg-black-deep/10 dark:hover:bg-bg-light/10 rounded"
                >
                  <FilePlus size={14} />
                </button>
              </div>

              {selectedFolderId === folder.id && (
                <div className="ml-6 space-y-1">
                  {folder.blocks.map((block) => (
                    <div 
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`flex items-center gap-2 p-2 rounded-ios cursor-pointer text-sm transition-colors ${selectedBlockId === block.id ? 'bg-black-deep text-bg-light dark:bg-bg-light dark:text-black-deep' : 'hover:bg-gray-light/50 dark:hover:bg-gray-mid/50'}`}
                    >
                      <FileText size={16} />
                      <span className="truncate">{block.title}</span>
                    </div>
                  ))}
                  {folder.blocks.length === 0 && (
                    <div className="text-[10px] opacity-40 py-2 italic ml-6">Vazio</div>
                  )}
                </div>
              )}
            </div>
          ))}
          {state.noteFolders.length === 0 && (
            <div className="text-center py-12 opacity-40 text-sm italic">Nenhuma pasta criada.</div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 card bg-bg-light dark:bg-black-soft flex flex-col p-0 overflow-hidden">
        {selectedBlock ? (
          <>
            {/* Toolbar */}
            <div className="p-3 border-bottom border-gray-light dark:border-gray-mid flex items-center justify-between bg-bg-ice dark:bg-gray-charcoal">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                  <Type size={16} className="opacity-40" />
                  <select 
                    value={selectedBlock.fontSize}
                    onChange={e => handleUpdateFontSize(parseInt(e.target.value))}
                    className="bg-transparent text-sm font-bold outline-none"
                  >
                    {[12, 14, 16, 18, 20, 24, 32].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
                <button className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded transition-colors">
                  <Bold size={18} />
                </button>
                <button className="p-2 hover:bg-gray-light dark:hover:bg-gray-mid rounded transition-colors">
                  <Italic size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-40 uppercase font-bold mr-2">
                  Salvo às {format(new Date(selectedBlock.lastModified), 'HH:mm')}
                </span>
                <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-8 overflow-y-auto">
              <input 
                type="text" 
                value={selectedBlock.title}
                onChange={e => {
                  const updatedFolders = state.noteFolders.map(f => {
                    if (f.id === selectedFolderId) {
                      return {
                        ...f,
                        blocks: f.blocks.map(b => b.id === selectedBlockId ? { ...b, title: e.target.value } : b)
                      };
                    }
                    return f;
                  });
                  onUpdateFolders(updatedFolders);
                }}
                className="w-full text-3xl font-bold bg-transparent outline-none mb-6"
                placeholder="Título da nota..."
              />
              <textarea 
                value={selectedBlock.content}
                onChange={e => handleUpdateBlock(e.target.value)}
                style={{ fontSize: `${selectedBlock.fontSize}px` }}
                className="w-full h-full bg-transparent outline-none resize-none leading-relaxed"
                placeholder="Comece a escrever..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-12 text-center">
            <StickyNote size={64} className="mb-4" />
            <h3 className="text-xl font-bold">Selecione ou crie uma nota</h3>
            <p className="max-w-xs mt-2">Suas ideias e resumos organizados em um só lugar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StickyNote({ size, className }: { size: number, className?: string }) {
  return <FileText size={size} className={className} />;
}
