export interface ActivityEvent {
  id: string;
  timestamp: string;
  event: string;
  category: string;
  project?: string;
  status: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface AINotification {
  id: string;
  timestamp: string;
  titleTr: string;
  titleEn: string;
  category: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface ProjectStats {
  name: string;
  lastOpened: string;
  lastEdited: string;
  taskCount: number;
  completedTaskCount: number;
  workflowCount: number;
  memoryCount: number;
  currentProvider: string;
  completionPercentage: number;
}

export interface WorkspaceInsights {
  dailyScore: number;
  weeklyScore: number;
  filesEdited: number;
  tasksCompleted: number;
  providerUsage: { [provider: string]: number };
  memoryGrowth: number;
}

export class MoniIntelligenceEngine {
  private static instance: MoniIntelligenceEngine;

  private constructor() {}

  public static getInstance(): MoniIntelligenceEngine {
    if (!MoniIntelligenceEngine.instance) {
      MoniIntelligenceEngine.instance = new MoniIntelligenceEngine();
    }
    return MoniIntelligenceEngine.instance;
  }

  // --- ACTIVITY TIMELINE ---
  public getEvents(): ActivityEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('moni_timeline_events');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logEvent(event: string, category: string, project: string = '', status: string = 'success', severity: ActivityEvent['severity'] = 'info'): void {
    if (typeof window === 'undefined') return;
    try {
      const events = this.getEvents();
      // Cap at 100 events to prevent growth issues
      if (events.length >= 100) events.shift();
      
      const newEv: ActivityEvent = {
        id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        event,
        category,
        project,
        status,
        severity
      };
      events.push(newEv);
      localStorage.setItem('moni_timeline_events', JSON.stringify(events));
      
      // Also trigger a notification if severity is warning/error
      if (severity === 'warning' || severity === 'error') {
        this.addNotification(
          `Sistem Uyarısı: ${event}`,
          `System Warning: ${event}`,
          severity
        );
      }
    } catch (e) {
      console.error('Failed to log timeline event', e);
    }
  }

  // --- NOTIFICATION CENTER ---
  public getNotifications(): AINotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('moni_notifications');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addNotification(titleTr: string, titleEn: string, category: AINotification['category']): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getNotifications();
      if (list.length >= 50) list.shift();

      const newNotif: AINotification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        titleTr,
        titleEn,
        category,
        read: false
      };
      list.push(newNotif);
      localStorage.setItem('moni_notifications', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to add notification', e);
    }
  }

  public markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getNotifications().map(n => ({ ...n, read: true }));
      localStorage.setItem('moni_notifications', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  public markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('moni_notifications', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  public clearAllNotifications(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('moni_notifications', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  }

  // --- PROJECT INTELLIGENCE ---
  public getProjectStats(projectName: string, taskList: any[] = []): ProjectStats {
    // Return statistics for active project name
    const count = taskList.length;
    const completedCount = taskList.filter((t: any) => t.isCompleted).length;
    const completionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;

    return {
      name: projectName || 'MONI OS Workspace',
      lastOpened: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      taskCount: count,
      completedTaskCount: completedCount,
      workflowCount: 3,
      memoryCount: 12,
      currentProvider: 'Local Fallback',
      completionPercentage: completionRate
    };
  }

  // --- SMART RECOMMENDATION ENGINE ---
  public getRecommendations(language: 'tr' | 'en', taskList: any[] = []): string[] {
    const isTr = language === 'tr';
    const suggestions: string[] = [];
    
    const activeTasks = taskList.filter((t: any) => !t.isCompleted);
    if (activeTasks.length > 0) {
      suggestions.push(
        isTr 
          ? `Devam etmen gereken ${activeTasks.length} adet aktif görevin var. Başlayalım mı?`
          : `You have ${activeTasks.length} pending tasks. Shall we continue?`
      );
    }

    const lastProject = typeof window !== 'undefined' ? localStorage.getItem('moni_last_project') : '';
    if (lastProject) {
      suggestions.push(
        isTr
          ? `Dün çalıştığın "${lastProject}" projesini açmak ister misin?`
          : `Would you like to open the "${lastProject}" project you worked on yesterday?`
      );
    }

    suggestions.push(
      isTr
        ? "Yapay zeka ses asistanı modülasyon tonunu test edelim mi?"
        : "Shall we test the voice modulator settings?"
    );

    return suggestions;
  }

  // --- WORKSPACE INSIGHTS & PRODUCTIVITY ---
  public getProductivityInsights(taskList: any[] = [], memories: any[] = []): WorkspaceInsights {
    const completedTasks = taskList.filter((t: any) => t.isCompleted).length;
    
    // Dynamic score calculation
    const dailyScore = Math.min(100, 30 + completedTasks * 15 + memories.length * 5);
    const weeklyScore = Math.min(100, Math.round(dailyScore * 0.9));

    return {
      dailyScore,
      weeklyScore,
      filesEdited: 4,
      tasksCompleted: completedTasks,
      providerUsage: { 'Local Fallback': 92, 'Gemini': 8 },
      memoryGrowth: memories.length
    };
  }
}
