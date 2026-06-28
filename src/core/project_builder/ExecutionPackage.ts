import type { ProjectBlueprint } from './ProjectBlueprint';

export interface DependencyNode {
  id: string;
  type: 'module' | 'api' | 'database' | 'service' | 'component' | 'aiTask' | 'testSuite';
  dependencies: string[];
}

export interface BuildStage {
  name: string;
  description: string;
  tasks: string[];
}

export interface TimelineMilestone {
  name: string;
  estimatedWeek: number;
  deliverables: string[];
}

export interface TechnicalRisk {
  id: string;
  category: 'technical' | 'security' | 'performance' | 'ai' | 'thirdParty';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  score: number; // 0-10
}

export interface ComplexityMetrics {
  estimatedLinesOfCode: number;
  moduleCount: number;
  apiCount: number;
  databaseSizeMb: number;
  uiComplexity: 'low' | 'medium' | 'high';
  aiComplexity: 'low' | 'medium' | 'high';
  overallScore: number; // 0-100
}

export interface SprintDefinition {
  id: string;
  name: string;
  durationDays: number;
  features: string[];
}

export interface DeveloperCodingTask {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  estimatedHours: number;
  responsibleAgent: string;
  targetModule: string;
  approvalRequired: boolean;
}

export interface QualityGate {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  requiredForGeneration: boolean;
}

export interface ExecutionPackage {
  requestId: string;
  userInput: string;
  blueprint: ProjectBlueprint;
  dependencyGraph: DependencyNode[];
  buildPipeline: BuildStage[];
  timeline: {
    phases: string[];
    milestones: TimelineMilestone[];
    criticalPath: string[];
    expectedCompletionDays: number;
  };
  risks: TechnicalRisk[];
  complexity: ComplexityMetrics;
  sprints: SprintDefinition[];
  featureDependencies: Record<string, string[]>;
  codingTasks: DeveloperCodingTask[];
  qualityGates: QualityGate[];
  readinessScore: number; // 0-100
  approved: boolean;
}
