import React, { createContext, useContext, useState, useEffect } from 'react';
import { databaseService } from '../../../data/db/LocalDatabase';

interface WorkspaceContextType {
  notes: any[];
  todos: any[];
  reminders: any[];
  memories: any[];
  refreshData: () => Promise<void>;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProject: string | null;
  setSelectedProject: (proj: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('chat');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const n = await databaseService.getNotes();
      const t = await databaseService.getTodos();
      const r = await databaseService.getReminders();
      const m = await databaseService.getMemories();
      setNotes(n);
      setTodos(t);
      setReminders(r);
      setMemories(m);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      notes,
      todos,
      reminders,
      memories,
      refreshData,
      activeView,
      setActiveView,
      selectedProject,
      setSelectedProject
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
