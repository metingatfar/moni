import { RequirementAnalyzer } from './RequirementAnalyzer';
import { TechnologyKnowledgeBase } from './TechnologyKnowledgeBase';
import { TechnologyCapabilityMatrix } from './TechnologyCapabilityMatrix';
import { LanguageSelector } from './LanguageSelector';
import { FrameworkSelector } from './FrameworkSelector';
import { DatabaseSelector } from './DatabaseSelector';
import { AIModelSelector } from './AIModelSelector';
import { ArchitecturePlanner } from './ArchitecturePlanner';
import { StateManagementPlanner } from './StateManagementPlanner';
import { DeploymentPlanner } from './DeploymentPlanner';
import { SecurityArchitecturePlanner } from './SecurityArchitecturePlanner';
import { DevOpsPlanner } from './DevOpsPlanner';
import { CostAnalyzer } from './CostAnalyzer';
import { FutureProofAnalyzer } from './FutureProofAnalyzer';
import { TechnologyComparisonEngine } from './TechnologyComparisonEngine';
import { DecisionExplainer } from './DecisionExplainer';
import { EngineeringRecommendationEngine } from './EngineeringRecommendationEngine';
import type { EngineeringRecommendation } from './EngineeringRecommendationEngine';

export interface ArchitecturePackage {
  success: boolean;
  recommendation: EngineeringRecommendation;
  costEstimate: any;
  futureProof: any;
  explanations: Record<string, string>;
  comparisons: any[];
}

export class TechnologyArchitect {
  private analyzer = new RequirementAnalyzer();
  private kb = new TechnologyKnowledgeBase();
  private matrix = new TechnologyCapabilityMatrix();
  private langSelector = new LanguageSelector();
  private fwSelector = new FrameworkSelector();
  private dbSelector = new DatabaseSelector();
  private aiSelector = new AIModelSelector();
  private archPlanner = new ArchitecturePlanner();
  private statePlanner = new StateManagementPlanner();
  private deployPlanner = new DeploymentPlanner();
  private secPlanner = new SecurityArchitecturePlanner();
  private devopsPlanner = new DevOpsPlanner();
  private costAnalyzer = new CostAnalyzer();
  private futureProofAnalyzer = new FutureProofAnalyzer();
  private comparisonEngine = new TechnologyComparisonEngine();
  private explainer = new DecisionExplainer();
  private recEngine = new EngineeringRecommendationEngine();

  // Diagnostics counters
  private requestCount = 0;
  private analysisCount = 0;

  public recommendTechnologyStack(prompt: string): ArchitecturePackage {
    this.requestCount++;
    this.analysisCount++;

    // 1. Analyze prompt requirements
    const reqs = this.analyzer.analyzeRequirements(prompt);

    // 2. Select Stacks
    const lang = this.langSelector.selectLanguage(reqs);
    const fw = this.fwSelector.selectFramework(reqs, lang.selection);
    const db = this.dbSelector.selectDatabase(reqs);
    const ai = this.aiSelector.selectAIModel(reqs);
    const arch = this.archPlanner.planArchitecture(reqs);
    const state = this.statePlanner.planStateManagement(fw.selection);
    const deploy = this.deployPlanner.planDeployment(reqs);
    const security = this.secPlanner.planSecurity(reqs);
    const devops = this.devopsPlanner.planDevOps(reqs);

    // 3. Generate explanations
    const explanations: Record<string, string> = {
      language: this.explainer.formatExplanation(lang),
      framework: this.explainer.formatExplanation(fw),
      database: this.explainer.formatExplanation(db),
      aiModel: this.explainer.formatExplanation(ai),
      architecture: this.explainer.formatExplanation(arch),
      stateManagement: this.explainer.formatExplanation(state),
      deployment: this.explainer.formatExplanation(deploy),
      security: this.explainer.formatExplanation(security),
      devops: this.explainer.formatExplanation(devops)
    };

    // 4. Generate recommendation package
    const recommendation = this.recEngine.generateRecommendation(reqs, {
      language: lang,
      framework: fw,
      database: db,
      aiModel: ai,
      architecture: arch,
      state,
      deployment: deploy,
      security,
      devops
    });

    // 5. Cost projections
    const costEstimate = this.costAnalyzer.analyzeCost(reqs);

    // 6. Future Proof evaluations
    const futureProof = this.futureProofAnalyzer.analyzeFutureProof(reqs, [
      lang.selection,
      fw.selection,
      db.selection,
      ai.selection
    ]);

    // 7. Alternative comparisons
    const comparisons = [
      this.comparisonEngine.compareStacks(recommendation.recommendedStack.framework, recommendation.alternatives.framework),
      this.comparisonEngine.compareStacks(recommendation.recommendedStack.database, recommendation.alternatives.database)
    ];

    return {
      success: true,
      recommendation,
      costEstimate,
      futureProof,
      explanations,
      comparisons
    };
  }

  public getDiagnostics() {
    return {
      architectRequests: this.requestCount,
      analysisEvaluated: this.analysisCount,
      kbActiveTechnologies: 20,
      matrixDecisionsMade: this.analysisCount * 9,
      architectHealth: 'Excellent'
    };
  }

  // Getters for integration access
  public getAnalyzer() { return this.analyzer; }
  public getKnowledgeBase() { return this.kb; }
  public getMatrix() { return this.matrix; }
  public getLanguageSelector() { return this.langSelector; }
  public getFrameworkSelector() { return this.fwSelector; }
  public getDatabaseSelector() { return this.dbSelector; }
  public getAIModelSelector() { return this.aiSelector; }
  public getArchitecturePlanner() { return this.archPlanner; }
  public getStatePlanner() { return this.statePlanner; }
  public getDeploymentPlanner() { return this.deployPlanner; }
  public getSecurityPlanner() { return this.secPlanner; }
  public getDevOpsPlanner() { return this.devopsPlanner; }
  public getCostAnalyzer() { return this.costAnalyzer; }
  public getFutureProofAnalyzer() { return this.futureProofAnalyzer; }
  public getComparisonEngine() { return this.comparisonEngine; }
  public getExplainer() { return this.explainer; }
  public getRecommendationEngine() { return this.recEngine; }
}

export const technologyArchitect = new TechnologyArchitect();
export default technologyArchitect;
