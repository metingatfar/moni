import type { Goal } from './Goal';
import { GoalPlanner } from './GoalPlanner';
import { GoalTracker } from './GoalTracker';
import { GoalAnalyzer, type GoalAnalysisResult } from './GoalAnalyzer';
import { GoalPredictor, type GoalPrediction } from './GoalPredictor';
import { GoalRecommendationEngine, type GoalRecommendation } from './GoalRecommendationEngine';
import { container } from '../container/ServiceContainer';

export class GoalEngine {
  private goals: Goal[] = [];
  private planner = new GoalPlanner();
  private tracker = new GoalTracker();
  private analyzer = new GoalAnalyzer();
  private predictor = new GoalPredictor();
  private recommendationEngine = new GoalRecommendationEngine();
  
  private lastAnalysisTime = 0;
  private throttleIntervalMs = 5000;
  private lastAnalysisResult: GoalAnalysisResult | null = null;
  private lastPredictionResult: GoalPrediction | null = null;
  private lastRecommendationResult: GoalRecommendation[] = [];

  constructor() {
    this.loadGoals();
  }

  private loadGoals(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('moni_goals');
        if (stored) {
          this.goals = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error('[GoalEngine] Failed to load goals:', e);
    }
  }

  private saveGoals(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('moni_goals', JSON.stringify(this.goals));
      }
    } catch (e) {
      console.error('[GoalEngine] Failed to save goals:', e);
    }
  }

  public getGoals(): Goal[] {
    return this.goals;
  }

  public getGoal(id: string): Goal | undefined {
    return this.goals.find(g => g.id === id);
  }

  public createGoal(
    title: string,
    category = 'other',
    priority: 'low' | 'medium' | 'high' = 'medium',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    deadline?: string,
    requiresConfirmation = false
  ): Goal {
    // Prevent duplicate goals by title match
    const existing = this.goals.find(g => g.title.toLowerCase() === title.toLowerCase() && g.status === 'active');
    if (existing) {
      console.log(`[GoalEngine] Goal already exists: ${title}`);
      return existing;
    }

    const id = `goal-${Date.now()}`;
    const targetDeadline = deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newGoal: Goal = {
      id,
      title,
      description: `${title} hedefini gerçekleştirmek.`,
      category,
      priority,
      difficulty,
      deadline: targetDeadline,
      status: 'active',
      progress: 0,
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requiresConfirmation
    };

    // Plan milestones
    newGoal.milestones = this.planner.planMilestones(id, title, category, targetDeadline);
    
    // Auto-generate workflow recommendations
    try {
      const we = container.resolve<any>('WorkflowEngine');
      if (we) {
        const recs = we.planRecommendationsForGoal(id, title);
        for (const rec of recs) {
          we.createWorkflow(rec);
        }
      }
    } catch (_) {}

    this.goals.push(newGoal);
    this.saveGoals();
    return newGoal;
  }

  public updateGoalProgress(id: string, progress: number, status?: 'active' | 'completed' | 'abandoned'): boolean {
    const goal = this.getGoal(id);
    if (!goal) return false;

    goal.progress = progress;
    if (status) {
      goal.status = status;
      if (status === 'completed') {
        goal.completedAt = new Date().toISOString();
      }
    }
    goal.updatedAt = new Date().toISOString();
    this.saveGoals();
    return true;
  }

  public completeGoal(id: string): boolean {
    const goal = this.getGoal(id);
    if (!goal) return false;

    goal.status = 'completed';
    goal.progress = 100;
    goal.completedAt = new Date().toISOString();
    goal.updatedAt = new Date().toISOString();
    
    // Complete all milestones
    for (const ms of goal.milestones) {
      ms.status = 'completed';
      ms.completedAt = new Date().toISOString();
    }

    this.saveGoals();
    return true;
  }

  public analyze(lifeSnapshot: any, force = false): { analysis: GoalAnalysisResult | null; prediction: GoalPrediction | null } {
    const now = Date.now();
    if (!force && now - this.lastAnalysisTime < this.throttleIntervalMs) {
      return { analysis: this.lastAnalysisResult, prediction: this.lastPredictionResult };
    }

    const activeGoals = this.goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      const targetGoal = activeGoals[0]; // Analyze primary active goal
      this.tracker.updateProgress(targetGoal, lifeSnapshot);
      this.lastAnalysisResult = this.analyzer.analyzeGoal(targetGoal, lifeSnapshot);
      this.lastPredictionResult = this.predictor.predictGoalCompletion(targetGoal, lifeSnapshot);
    } else {
      this.lastAnalysisResult = null;
      this.lastPredictionResult = null;
    }

    this.lastAnalysisTime = now;
    this.saveGoals();

    return { analysis: this.lastAnalysisResult, prediction: this.lastPredictionResult };
  }

  public generateWeeklyPlan(goalId: string): string[] {
    const goal = this.getGoal(goalId);
    if (!goal) return ["Aktif bir hedef bulunamadı."];

    const suggestions = this.planner.suggestTasksAndReminders(goal);
    return suggestions.tasks.map(t => `${t.title} (${goal.title})`);
  }

  public generateDailyPlan(goalId: string): string[] {
    const goal = this.getGoal(goalId);
    if (!goal) return ["Bugün için planlanmış özel bir hedef görevi bulunmuyor."];

    const suggestions = this.planner.suggestTasksAndReminders(goal);
    return suggestions.reminders.map(r => `${r.title} - Saat: ${r.time}`);
  }

  public generateProgressReport(): string {
    const active = this.goals.filter(g => g.status === 'active');
    const completed = this.goals.filter(g => g.status === 'completed');
    
    if (active.length === 0 && completed.length === 0) {
      return "Henüz tanımlanmış bir hedefiniz bulunmuyor.";
    }

    let report = `[Hedef Gelişim Raporu]:\n- Aktif Hedef Sayısı: ${active.length}\n- Tamamlanan Hedef Sayısı: ${completed.length}\n`;
    
    for (const g of active) {
      const pred = this.lastPredictionResult || { completionProbability: 82 };
      report += `- ${g.title}: İlerleme %${g.progress}, Tamamlama Olasılığı: %${pred.completionProbability}\n`;
    }

    return report;
  }

  public getDiagnostics(lifeSnapshot: any) {
    const activeCount = this.goals.filter(g => g.status === 'active').length;
    const completedCount = this.goals.filter(g => g.status === 'completed').length;
    const totalMilestones = this.goals.reduce((acc, g) => acc + g.milestones.length, 0);
    
    // Lazy analyze if needed to update diagnostics values
    this.analyze(lifeSnapshot);

    const goalCompletionRate = this.goals.length > 0 
      ? Math.round((completedCount / this.goals.length) * 100) 
      : 0;

    return {
      totalGoalsCount: this.goals.length,
      activeGoalsCount: activeCount,
      completedGoalsCount: completedCount,
      milestonesCount: totalMilestones,
      goalScore: activeCount > 0 ? this.goals[0].progress : 0,
      goalCompletionRate,
      predictionPercentage: this.lastPredictionResult ? this.lastPredictionResult.completionProbability : 0,
      lastAnalysisResult: this.lastAnalysisResult ? this.lastAnalysisResult.suggestions[0] : 'Analiz edilmedi',
      lastSuggestion: this.lastRecommendationResult.length > 0 ? this.lastRecommendationResult[0].title : 'Öneri yok'
    };
  }

  public getRecommendations(lifeSnapshot: any, memoryFacts: any[]): GoalRecommendation[] {
    this.lastRecommendationResult = this.recommendationEngine.generateRecommendations(lifeSnapshot, memoryFacts);
    return this.lastRecommendationResult;
  }
}

export const goalEngine = new GoalEngine();
