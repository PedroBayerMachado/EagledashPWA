import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Records from './components/Records';
import Pomodoro from './components/Pomodoro';
import Notes from './components/Notes';
import Vault from './components/Vault';
import Subjects from './components/Subjects';
import TargetExam from './components/TargetExam';
import Analytics from './components/Analytics';
import { useAppState } from './hooks/useAppState';

export default function App() {
  const { 
    state, 
    addRecord, 
    addTask, 
    toggleTask, 
    addPomodoro, 
    addPassword, 
    updateNoteFolders,
    addSubject,
    updateSubject,
    removeSubject,
    setTargetExam,
    setVaultPin,
    updateGoals
  } = useAppState();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} onAddRecord={() => setActiveTab('records')} onUpdateGoals={updateGoals} />;
      case 'target':
        return <TargetExam state={state} onSetTarget={setTargetExam} />;
      case 'agenda':
        return <Agenda state={state} onAddTask={addTask} onToggleTask={toggleTask} />;
      case 'records':
        return <Records state={state} onAddRecord={addRecord} />;
      case 'pomodoro':
        return <Pomodoro state={state} onAddSession={addPomodoro} />;
      case 'notes':
        return <Notes state={state} onUpdateFolders={updateNoteFolders} />;
      case 'analytics':
        return <Analytics state={state} />;
      case 'vault':
        return <Vault state={state} onAddPassword={addPassword} onSetPin={setVaultPin} />;
      case 'subjects':
        return <Subjects 
          state={state} 
          onAddSubject={addSubject} 
          onUpdateSubject={updateSubject} 
          onRemoveSubject={removeSubject} 
        />;
      default:
        return <Dashboard state={state} onAddRecord={() => setActiveTab('records')} onUpdateGoals={updateGoals} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
