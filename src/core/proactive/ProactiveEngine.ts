import type { LifeModel } from '../life/LifeModel';
import { InsightEngine } from './InsightEngine';
import { RecommendationEngineV2 } from './RecommendationEngineV2';
import { PredictionEngine } from './PredictionEngine';
import { RiskEngine } from './RiskEngine';
import { DailyBriefGenerator } from './DailyBriefGenerator';
import { WeeklyReviewGenerator } from './WeeklyReviewGenerator';
import { MonthlyReviewGenerator } from './MonthlyReviewGenerator';
import { SuggestionEngine } from './SuggestionEngine';

export class ProactiveEngine {
  private insightEngine = new InsightEngine();
  private recEngine = new RecommendationEngineV2();
  private predictionEngine = new PredictionEngine();
  private riskEngine = new RiskEngine();
  private briefGenerator: DailyBriefGenerator;
  private weeklyGenerator = new WeeklyReviewGenerator();
  private monthlyGenerator = new MonthlyReviewGenerator();
  private suggestionEngine = new SuggestionEngine();

  // Throttling & Cache state
  private lastAnalysisTime = 0;
  private throttleIntervalMs = 10000; // 10 seconds throttle
  private cachedInsights: string[] = [];
  private cachedRisks: string[] = [];
  private cachedPredictions: string[] = [];

  // Diagnostics counters
  private dailyBriefCount = 0;
  private weeklyReviewCount = 0;
  private monthlyReviewCount = 0;
  private lastBriefTimeStr = 'Never';
  private lastWeeklyTimeStr = 'Never';
  private lastMonthlyTimeStr = 'Never';
  private lastAction = 'Initialized';

  constructor() {
    this.briefGenerator = new DailyBriefGenerator(this.recEngine, this.riskEngine);
  }

  private async runProactiveAnalysisIfNeeded(lifeModel: LifeModel): Promise<void> {
    const now = Date.now();
    if (now - this.lastAnalysisTime < this.throttleIntervalMs) {
      return;
    }

    try {
      this.cachedInsights = this.insightEngine.getInsights(lifeModel);
      this.cachedRisks = this.riskEngine.getRisks(lifeModel);
      this.cachedPredictions = this.predictionEngine.getPredictions(lifeModel);
      this.lastAnalysisTime = now;
      this.lastAction = 'Analyzed life data';
    } catch (e) {
      console.error('[ProactiveEngine] Run analysis failed:', e);
    }
  }

  public async generateDailyBrief(lifeModel: LifeModel, userName: string): Promise<string> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    const brief = this.briefGenerator.generateBrief(lifeModel, userName);
    this.dailyBriefCount++;
    this.lastBriefTimeStr = new Date().toISOString();
    this.lastAction = 'Generated Daily Brief';
    return brief;
  }

  public async generateSuggestions(trigger: 'startup' | 'morning' | 'idle' | 'task_created' | 'fatigue_or_sadness', lifeModel: LifeModel): Promise<string> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    const suggestion = this.suggestionEngine.getContextualSuggestion(trigger, lifeModel);
    this.lastAction = `Generated Suggestion (${trigger})`;
    return suggestion;
  }

  public async generateInsights(lifeModel: LifeModel): Promise<string[]> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    return this.cachedInsights;
  }

  public async generateRisks(lifeModel: LifeModel): Promise<string[]> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    return this.cachedRisks;
  }

  public async generatePredictions(lifeModel: LifeModel): Promise<string[]> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    return this.cachedPredictions;
  }

  public async generateWeeklyReview(lifeModel: LifeModel, userName: string): Promise<string> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    const review = this.weeklyGenerator.generateWeeklyReview(lifeModel, userName);
    this.weeklyReviewCount++;
    this.lastWeeklyTimeStr = new Date().toISOString();
    this.lastAction = 'Generated Weekly Review';
    return review;
  }

  public async generateMonthlyReview(lifeModel: LifeModel, userName: string): Promise<string> {
    await this.runProactiveAnalysisIfNeeded(lifeModel);
    const review = this.monthlyGenerator.generateMonthlyReview(lifeModel, userName);
    this.monthlyReviewCount++;
    this.lastMonthlyTimeStr = new Date().toISOString();
    this.lastAction = 'Generated Monthly Review';
    return review;
  }

  public getDiagnostics() {
    return {
      insightCount: this.cachedInsights.length,
      suggestionCount: 1, // trigger based
      riskCount: this.cachedRisks.length,
      predictionCount: this.cachedPredictions.length,
      lastDailyBriefTime: this.lastBriefTimeStr,
      lastWeeklyReviewTime: this.lastWeeklyTimeStr,
      lastMonthlyReviewTime: this.lastMonthlyTimeStr,
      proactiveStatus: 'Active',
      lastProactiveAction: this.lastAction
    };
  }
}
export const proactiveEngine = new ProactiveEngine();
