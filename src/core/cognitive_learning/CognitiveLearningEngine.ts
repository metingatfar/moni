import { ExperienceCollector } from './ExperienceCollector';
import type { Experience } from './ExperienceCollector';
import { OutcomeEvaluator } from './OutcomeEvaluator';
import { StrategyLearner } from './StrategyLearner';
import { MistakeAnalyzer } from './MistakeAnalyzer';
import { PatternMiner } from './PatternMiner';
import { PreferenceLearner } from './PreferenceLearner';
import { SelfImprovementPlanner } from './SelfImprovementPlanner';
import { MemoryConsolidator } from './MemoryConsolidator';
import { LearningScoreEngine } from './LearningScoreEngine';

export class CognitiveLearningEngine {
  public collector = new ExperienceCollector();
  public evaluator = new OutcomeEvaluator();
  public learner = new StrategyLearner();
  public mistakes = new MistakeAnalyzer();
  public miner = new PatternMiner();
  public preferences = new PreferenceLearner();
  public planner = new SelfImprovementPlanner();
  public consolidator = new MemoryConsolidator();
  public scores = new LearningScoreEngine();

  /**
   * Main entry point to learn from a completed experience
   */
  public async learn(expData: Omit<Experience, 'id' | 'timestamp'>): Promise<Experience> {
    // 1. Collect experience
    const exp = this.collector.addExperience(expData);

    // 2. Evaluate outcome success/failure
    const outcome = this.evaluator.evaluate(exp);

    // 3. Learn strategy success rate
    this.learner.learnStrategy(exp.strategyUsed, outcome);

    // 4. Extract mistake categories
    if (exp.userFeedback === 'dislike') {
      this.mistakes.analyzeMistake(exp);
      this.scores.updateScores('dislike', exp.strategyUsed);
    } else if (exp.userFeedback === 'like') {
      this.scores.updateScores('like', exp.strategyUsed);
    }

    // 5. Mine pattern
    this.miner.minePattern(exp);

    // 6. Learn user preferences
    this.preferences.learnPreferences(exp);

    // 7. Consolidate facts to long-term memory
    this.consolidator.consolidate(exp, outcome);

    return exp;
  }

  /**
   * Get diagnostics for MONI's dashboard
   */
  public getDiagnostics() {
    const experiences = this.collector.getExperiences();
    const overallScore = this.scores.calculateOverallScore();
    const suggestions = this.planner.generateSuggestions(this.scores.getScores());
    const patterns = this.miner.getLearnedPatterns();
    const prefs = this.preferences.getPreferences();

    // Determine best and weakest modules
    const scoresMap = this.scores.getScores();
    let bestModule = 'None';
    let bestVal = -1;
    let weakestModule = 'None';
    let weakestVal = 101;

    for (const [mod, val] of Object.entries(scoresMap)) {
      if (val > bestVal) {
        bestVal = val;
        bestModule = mod;
      }
      if (val < weakestVal) {
        weakestVal = val;
        weakestModule = mod;
      }
    }

    return {
      experienceCount: experiences.length,
      learningScore: overallScore,
      successfulStrategies: this.learner.getBestStrategies().length,
      failedStrategies: this.learner.getFailedStrategies().length,
      patternsLearned: patterns.length,
      userPreferences: `Length: ${prefs.responseLength}, Style: ${prefs.style}`,
      mistakesDetected: this.mistakes.getMistakes().length,
      memoryConsolidations: experiences.filter(e => e.userFeedback === 'like').length, // count of likes
      selfImprovementSuggestions: suggestions.length,
      bestPerformingModule: bestModule,
      weakestModule: weakestModule
    };
  }
}

export const cognitiveLearningEngine = new CognitiveLearningEngine();
export default cognitiveLearningEngine;
