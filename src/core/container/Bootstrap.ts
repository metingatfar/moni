import { container } from './ServiceContainer';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { Planner } from '../planner/Planner';
import { ToolManager } from '../tools/ToolManager';
import { ShortTermMemory } from '../memory/ShortTermMemory';
import { LongTermMemory } from '../memory/LongTermMemory';
import { SpeechSynthesizer } from '../audio/SpeechSynthesizer';
import { SpeechRecognizer } from '../audio/SpeechRecognizer';
import { ExecutiveBrain } from '../brain/ExecutiveBrain';
import { ConversationEngine } from '../conversation/ConversationEngine';
import { LifeModel } from '../life/LifeModel';
import { ProactiveEngine } from '../proactive/ProactiveEngine';
import { goalEngine } from '../goals/GoalEngine';
import { WorkflowEngine } from '../workflow/WorkflowEngine';
import { WorkflowPlanner as WorkflowPlannerCore } from '../workflow/WorkflowPlanner';
import { WorkflowScheduler } from '../workflow/WorkflowScheduler';
import { WorkflowExecutor } from '../workflow/WorkflowExecutor';
import { WorkflowStateManager } from '../workflow/WorkflowStateManager';
import { WorkflowRecoveryEngine } from '../workflow/WorkflowRecoveryEngine';
import { WorkflowOptimizationEngine } from '../workflow/WorkflowOptimizationEngine';
import { WorkflowMetrics } from '../workflow/WorkflowMetrics';
import { WorkflowHistory } from '../workflow/WorkflowHistory';
import { WorkflowReplayEngine } from '../workflow/WorkflowReplayEngine';
import { WorkflowTemplateLibrary } from '../workflow/WorkflowTemplateLibrary';
import { WorkflowDesigner } from '../workflow/WorkflowDesigner';
import { WorkflowDependencyGraph } from '../workflow/WorkflowDependencyGraph';
import { WorkflowVersionManager } from '../workflow/WorkflowVersionManager';
import { WorkflowHealthEngine } from '../workflow/WorkflowHealthEngine';
import { WorkflowReportEngine } from '../workflow/WorkflowReportEngine';
import { WorkflowDecisionEngine } from '../workflow/WorkflowDecisionEngine';
import { WorkflowSimulationEngine } from '../workflow/WorkflowSimulationEngine';
import { WorkflowAnalyticsEngine } from '../workflow/WorkflowAnalyticsEngine';
import { WorkflowAIOptimizer } from '../workflow/WorkflowAIOptimizer';
import { WorkflowCostEngine } from '../workflow/WorkflowCostEngine';
import { WorkflowPredictionEngine } from '../workflow/WorkflowPredictionEngine';
import { WorkflowAutoOptimizer } from '../workflow/WorkflowAutoOptimizer';
import { multiAgentEngine } from '../collaboration/MultiAgentEngine';
import { observabilityCenter } from '../observability/ObservabilityCenter';

import { GoalAgent } from '../agents/GoalAgent';
import { HealthAgent } from '../agents/HealthAgent';
import { FitnessAgent } from '../agents/FitnessAgent';
import { WorkAgent } from '../agents/WorkAgent';
import { LearningAgent } from '../agents/LearningAgent';
import { NotificationAgent } from '../agents/NotificationAgent';
import { agentRegistry } from '../agents/AgentRegistry';
import { agentManager } from '../agents/AgentManager';

// Tools
import { TaskTool } from '../tools/TaskTool';
import { ReminderTool } from '../tools/ReminderTool';
import { MemoryTool } from '../tools/MemoryTool';
import { NotificationTool } from '../tools/NotificationTool';
import { WeatherTool } from '../tools/WeatherTool';
import { CameraTool } from '../tools/CameraTool';
import { CalendarTool } from '../tools/CalendarTool';
import { DosyaTool } from '../tools/DosyaTool';
import { MapsTool } from '../tools/MapsTool';
import { GoalTool } from '../tools/GoalTool';
import { WorkflowTool } from '../tools/WorkflowTool';

import { pluginManager } from '../plugins/PluginManager';
import { SpotifyPlugin } from '../../../plugins/SpotifyPlugin';
import { toolIntelligenceEngine } from '../tool_intelligence/ToolIntelligenceEngine';
import { planningEngine } from '../planning/PlanningEngine';
import { reasoningEngine } from '../reasoning/ReasoningEngine';
import { knowledgeEngine } from '../knowledge/KnowledgeEngine';
import { visionEngine } from '../vision/VisionEngine';
import { cognitiveLearningEngine } from '../cognitive_learning/CognitiveLearningEngine';
import { autonomousExecutiveEngine } from '../executive/AutonomousExecutiveEngine';
import { backupService } from '../backup/BackupService';
import { restoreService } from '../backup/RestoreService';
import { recoveryMode } from '../backup/RecoveryMode';
import { backupDiagnostics } from '../backup/BackupDiagnostics';
import { releaseManager } from '../release/ReleaseManager';
import { releaseDiagnostics } from '../release/ReleaseDiagnostics';
import { versionManager } from '../enterprise/VersionManager';
import { architectureHistory } from '../enterprise/ArchitectureHistory';
import { backupEncryption } from '../enterprise/BackupEncryption';
import { backupSignature } from '../enterprise/BackupSignature';
import { backupVerifier } from '../enterprise/BackupVerifier';
import { schemaVersionManager } from '../enterprise/SchemaVersionManager';
import { migrationEngine } from '../enterprise/MigrationEngine';
import { projectHealthEngine } from '../enterprise/ProjectHealthEngine';
import { recoveryCenter } from '../enterprise/RecoveryCenter';
import { auditTrail } from '../enterprise/AuditTrail';
import { integrityScanner } from '../enterprise/IntegrityScanner';
import { projectFingerprint } from '../enterprise/ProjectFingerprint';
import { architectureSnapshot } from '../enterprise/ArchitectureSnapshot';
import { dependencyScanner } from '../enterprise/DependencyScanner';
import { qualityGate } from '../enterprise/QualityGate';
import { changelogGenerator } from '../enterprise/ChangelogGenerator';
import { architectureIndex } from '../enterprise/ArchitectureIndex';
import { repositoryIntelligenceEngine } from '../repository/RepositoryIntelligenceEngine';
import { codeIntelligenceEngine } from '../repository/CodeIntelligenceEngine';
import { developerAgent } from '../repository/DeveloperAgent';
import { codeGenerationEngine } from '../codegen/CodeGenerationEngine';
import { patchApplicationEngine } from '../patch/PatchApplicationEngine';
import { patchReviewer } from '../patch/PatchReviewer';
import { patchValidator } from '../patch/PatchValidator';
import { rollbackManager } from '../patch/RollbackManager';
import { sandboxWorkspace } from '../patch/SandboxWorkspace';
import { applyPreparationEngine } from '../apply_preparation/ApplyPreparationEngine';
import { applyPreparationReport } from '../apply_preparation/ApplyPreparationReport';
import { applyReadinessValidator } from '../apply_preparation/ApplyReadinessValidator';
import { compilePreviewEngine } from '../apply_preparation/CompilePreviewEngine';
import { regressionPreviewRunner } from '../apply_preparation/RegressionPreviewRunner';
import { readinessScoreEngine } from '../apply_preparation/ReadinessScoreEngine';
import { applyPreviewEngine } from '../apply_preparation/ApplyPreviewEngine';
import { readyToApplyManifest } from '../apply_preparation/ReadyToApplyManifest';
import { approvalPackageBuilder } from '../apply_preparation/ApprovalPackageBuilder';
import { aiCodingOrchestrator } from '../orchestrator/AICodingOrchestrator';
import { providerRegistry } from '../orchestrator/ProviderRegistry';
import { providerSelector } from '../orchestrator/ProviderSelector';
import { promptCompiler } from '../orchestrator/PromptCompiler';
import { contextAssembler } from '../orchestrator/ContextAssembler';
import { modelRoutingEngine } from '../orchestrator/ModelRoutingEngine';
import { llmExecutionEngine } from '../llm/LLMExecutionEngine';
import { llmRuntime } from '../llm/LLMRuntime';
import { responseValidator } from '../llm/ResponseValidator';
import { responseNormalizer } from '../llm/ResponseNormalizer';
import { executionMetrics } from '../llm/ExecutionMetrics';
import { llmExecutionReport } from '../llm/LLMExecutionReport';
import { promptExecutionHistory } from '../llm/PromptExecutionHistory';
import { aiConsensusEngine } from '../consensus/AIConsensusEngine';
import { consensusAnalyzer } from '../consensus/ConsensusAnalyzer';
import { conflictResolver } from '../consensus/ConflictResolver';
import { consensusMetrics } from '../consensus/ConsensusMetrics';
import { consensusMemory } from '../consensus/ConsensusMemory';
import { knowledgeBaseEngine } from '../knowledge/KnowledgeBaseEngine';
import { knowledgeSearchEngine } from '../knowledge/KnowledgeSearchEngine';
import { engineeringKnowledgeGraph } from '../knowledge/EngineeringKnowledgeGraph';
import { sprintHistoryIndexer } from '../knowledge/SprintHistoryIndexer';
import { knowledgeMetrics } from '../knowledge/KnowledgeMetrics';
import { autonomousTaskPlanner } from '../project_manager/AutonomousTaskPlanner';
import { taskDecomposer } from '../project_manager/TaskDecomposer';
import { taskDependencyGraph } from '../project_manager/TaskDependencyGraph';
import { resourcePlanner } from '../project_manager/ResourcePlanner';
import { executionRoadmap } from '../project_manager/ExecutionRoadmap';
import { autonomousCodingEngine } from '../autonomous_coding/AutonomousCodingEngine';
import { frameworkDetector } from '../autonomous_coding/FrameworkDetector';
import { codeReuseAnalyzer } from '../autonomous_coding/CodeReuseAnalyzer';
import { selfVerificationEngine } from '../autonomous_coding/SelfVerificationEngine';
import { engineeringStandardsEngine } from '../autonomous_coding/EngineeringStandardsEngine';
import { autonomousTestingEngine } from '../testing/AutonomousTestingEngine';
import { testStrategyPlanner } from '../testing/TestStrategyPlanner';
import { unitTestGenerator } from '../testing/UnitTestGenerator';
import { integrationTestGenerator } from '../testing/IntegrationTestGenerator';
import { apiTestGenerator } from '../testing/APITestGenerator';
import { uiTestGenerator } from '../testing/UITestGenerator';
import { regressionTestPlanner } from '../testing/RegressionTestPlanner';
import { edgeCaseGenerator } from '../testing/EdgeCaseGenerator';
import { mockDataGenerator } from '../testing/MockDataGenerator';
import { coverageAnalyzer } from '../testing/CoverageAnalyzer';
import { mutationTestingEngine } from '../testing/MutationTestingEngine';
import { failureAnalyzer } from '../testing/FailureAnalyzer';
import { testQualityEngine } from '../testing/TestQualityEngine';
import { aiTestReviewEngine } from '../testing/AITestReviewEngine';
import { testPrioritizationEngine } from '../testing/TestPrioritizationEngine';
import { testSuiteOptimizer } from '../testing/TestSuiteOptimizer';
import { testReportGenerator } from '../testing/TestReportGenerator';
import { selfHealingAgent } from '../self_healing/SelfHealingAgent';
import { failureClassifier } from '../self_healing/FailureClassifier';
import { errorLogParser } from '../self_healing/ErrorLogParser';
import { rootCauseAnalyzer } from '../self_healing/RootCauseAnalyzer';
import { repairStrategyPlanner } from '../self_healing/RepairStrategyPlanner';
import { repairPatchPlanner } from '../self_healing/RepairPatchPlanner';
import { retryPolicyEngine } from '../self_healing/RetryPolicyEngine';
import { healingLoopEngine } from '../self_healing/HealingLoopEngine';
import { healingConfidenceScorer } from '../self_healing/HealingConfidenceScorer';
import { healingHistory } from '../self_healing/HealingHistory';
import { humanInterventionDetector } from '../self_healing/HumanInterventionDetector';
import { selfHealingReport } from '../self_healing/SelfHealingReport';

import { LiveDebugger } from '../self_healing/LiveDebugger';
import { ErrorClassifier } from '../self_healing/ErrorClassifier';
import { FixPlanner } from '../self_healing/FixPlanner';
import { PatchPlanner } from '../self_healing/PatchPlanner';
import { PatchValidator } from '../self_healing/PatchValidator';
import { HealingCoordinator } from '../self_healing/HealingCoordinator';
import { RegressionAnalyzer } from '../self_healing/RegressionAnalyzer';
import { DependencyRepairEngine } from '../self_healing/DependencyRepairEngine';
import { PerformanceRepairEngine } from '../self_healing/PerformanceRepairEngine';
import { SecurityRepairEngine } from '../self_healing/SecurityRepairEngine';
import { ArchitectureRepairEngine } from '../self_healing/ArchitectureRepairEngine';
import { TestFailureAnalyzer } from '../self_healing/TestFailureAnalyzer';
import { AIReasoningValidator } from '../self_healing/AIReasoningValidator';
import { ApprovalPackageGenerator } from '../self_healing/ApprovalPackageGenerator';
import { RollbackPlanner } from '../self_healing/RollbackPlanner';
import { SelfHealingMetrics } from '../self_healing/SelfHealingMetrics';
import { SelfHealingEngine } from '../self_healing/SelfHealingEngine';

// New Multi-Agent Collaboration 2.0 Imports
import { AgentCommunicationBus as NewAgentBus } from '../multi_agent/AgentCommunicationBus';
import { ConversationManager as NewConvMgr } from '../multi_agent/ConversationManager';
import { ConsensusEngine as NewConsensusEngine } from '../multi_agent/ConsensusEngine';
import { NegotiationEngine as NewNegEngine } from '../multi_agent/NegotiationEngine';
import { TaskDistributionEngine as NewTaskDistEngine } from '../multi_agent/TaskDistributionEngine';
import { AgentMemory as NewAgentMemory } from '../multi_agent/AgentMemory';
import { SharedKnowledgeBase as NewKnowledgeBase } from '../multi_agent/SharedKnowledgeBase';
import { CollaborationTimeline as NewTimeline } from '../multi_agent/CollaborationTimeline';
import { CollaborationMetrics as NewMetrics } from '../multi_agent/CollaborationMetrics';
import { ConflictManager as NewConflictMgr } from '../multi_agent/ConflictManager';
import { CollaborationReport as NewReport } from '../multi_agent/CollaborationReport';
import { CollaborationEngine as NewCollabEngine } from '../multi_agent/CollaborationEngine';
import { MultiAgentEngine as NewMultiAgentEngine } from '../multi_agent/MultiAgentEngine';
import { AgentReputationEngine } from '../multi_agent/AgentReputationEngine';
import { ReputationMetrics } from '../multi_agent/ReputationMetrics';
import { MeetingRecorder } from '../multi_agent/MeetingRecorder';
import { MeetingArchive } from '../multi_agent/MeetingArchive';
import { MeetingReplayEngine } from '../multi_agent/MeetingReplayEngine';
import { LearningEngine as NewLearningEngine } from '../multi_agent/LearningEngine';
import { EngineeringKnowledgeEvolution } from '../multi_agent/EngineeringKnowledgeEvolution';

// Sprint 6.6 Autonomous Execution Engine Imports
import { SandboxEngine } from '../execution/SandboxEngine';
import { FileExecutionEngine } from '../execution/FileExecutionEngine';
import { ProjectExecutionEngine } from '../execution/ProjectExecutionEngine';
import { ExecutionPolicyEngine } from '../execution/ExecutionPolicyEngine';
import { ApprovalExecutionManager } from '../execution/ApprovalExecutionManager';
import { ExecutionCheckpointManager } from '../execution/ExecutionCheckpointManager';
import { RollbackExecutionEngine } from '../execution/RollbackExecutionEngine';
import { PatchExecutionEngine } from '../execution/PatchExecutionEngine';
import { GitExecutionEngine } from '../execution/GitExecutionEngine';
import { WorkspaceScanner } from '../execution/WorkspaceScanner';
import { ExecutionMonitor } from '../execution/ExecutionMonitor';
import { ExecutionMetrics } from '../execution/ExecutionMetrics';
import { ExecutionReport } from '../execution/ExecutionReport';
import { ExecutionEngine } from '../execution/ExecutionEngine';

// Sprint 6.7 Plugin Marketplace & Tool Ecosystem Imports
import { PluginEngine as PluginSystemEngine } from '../plugin_system/PluginEngine';
import { PluginRegistry as PluginSystemRegistry } from '../plugin_system/PluginRegistry';
import { PluginInstaller as PluginSystemInstaller } from '../plugin_system/PluginInstaller';
import { PluginLoader as PluginSystemLoader } from '../plugin_system/PluginLoader';
import { PluginSecurityScanner } from '../plugin_system/PluginSecurityScanner';
import { PluginDependencyResolver } from '../plugin_system/PluginDependencyResolver';
import { PluginPermissionManager as PluginSystemPermissionManager } from '../plugin_system/PluginPermissionManager';
import { PluginMarketplace } from '../plugin_system/PluginMarketplace';
import { PluginUpdater } from '../plugin_system/PluginUpdater';
import { PluginMetrics as PluginSystemMetrics } from '../plugin_system/PluginMetrics';
import { PluginReport } from '../plugin_system/PluginReport';

// Sprint 6.7 Enterprise Addendum — Extended Plugin Ecosystem Imports
import { PluginCertificationEngine } from '../plugin_system/PluginCertificationEngine';
import { PluginSandboxManager } from '../plugin_system/PluginSandboxManager';
import { PluginGateway } from '../plugin_system/PluginGateway';
import { PluginSDK } from '../plugin_system/PluginSDK';
import { PluginManifestValidator } from '../plugin_system/PluginManifestValidator';
import { PluginAnalytics } from '../plugin_system/PluginAnalytics';
import { PluginRecommendationEngine } from '../plugin_system/PluginRecommendationEngine';

// Sprint 6.8 Enterprise Security & Compliance Automation Engine (SecOps)
import { SecurityPolicyManager } from '../security/SecurityPolicyManager';
import { ThreatDetectionEngine } from '../security/ThreatDetectionEngine';
import { VulnerabilityRemediationAgent } from '../security/VulnerabilityRemediationAgent';
import { SecretsManagementSimulator } from '../security/SecretsManagementSimulator';
import { RbacEnforcer } from '../security/RbacEnforcer';
import { ComplianceAuditEngine } from '../security/ComplianceAuditEngine';
import { SecurityReportEngine } from '../security/SecurityReportEngine';

import { uiDesignerAgent } from '../ui_designer/UIDesignerAgent';
import { visualDesignerStudio } from '../visual_designer/VisualDesignerStudio';
import { studioWorkspace } from '../studio/StudioWorkspace';
import { resourceManager } from '../resource_manager/ResourceManager';
import { visualBuilderEngine } from '../visual_builder/VisualBuilderEngine';
import { DragDropEngine } from '../visual_builder/DragDropEngine';
import { PropertyInspector } from '../visual_builder/PropertyInspector';
import { BuilderPreviewEngine } from '../visual_builder/BuilderPreviewEngine';
import { AIVisualCommandEngine } from '../visual_builder/AIVisualCommandEngine';
import { technologyArchitect } from '../technology_architect/TechnologyArchitect';
import { universalCodeGenerationEngine } from '../universal_generator/UniversalCodeGenerationEngine';
import { experienceEngine } from '../experience/ExperienceEngine';
import { moniBrain } from '../brain_memory/MONIBrain';
import { MONIOperatingSystem } from '../operating_system/MONIOperatingSystem';
import { OperatingSystemKernel } from '../operating_system/OperatingSystemKernel';
import { EngineRegistry } from '../operating_system/EngineRegistry';
import { EngineLifecycleManager } from '../operating_system/EngineLifecycleManager';
import { WorkflowPlanner } from '../operating_system/WorkflowPlanner';
import { TaskScheduler } from '../operating_system/TaskScheduler';
import { DependencyResolverOS } from '../operating_system/DependencyResolverOS';
import { ExecutionCoordinator } from '../operating_system/ExecutionCoordinator';
import { ApprovalGateManager } from '../operating_system/ApprovalGateManager';
import { EventBus } from '../operating_system/EventBus';
import { StateManager } from '../operating_system/StateManager';
import { ResourceAllocator } from '../operating_system/ResourceAllocator';
import { HealthMonitor } from '../operating_system/HealthMonitor';
import { RecoveryCoordinator } from '../operating_system/RecoveryCoordinator';
import { SystemDiagnostics } from '../operating_system/SystemDiagnostics';
import { OperatingSystemMetrics } from '../operating_system/OperatingSystemMetrics';
import { OperatingSystemReport } from '../operating_system/OperatingSystemReport';
import { PluginManager } from '../operating_system/PluginManager';
import { PermissionManager } from '../operating_system/PermissionManager';
import { WorkflowRecorder } from '../operating_system/WorkflowRecorder';
import { SessionManager } from '../operating_system/SessionManager';
import { MONIOSAPI } from '../operating_system/MONIOSAPI';
import { AutonomousProjectBuilder } from '../project_builder/AutonomousProjectBuilder';
import { ProjectBuilder } from '../project_builder/ProjectBuilder';
import { ProjectScaffolder } from '../project_builder/ProjectScaffolder';
import { ProjectBuilderReport } from '../project_builder/ProjectBuilderReport';
import { ModulePlanner } from '../project_builder/ModulePlanner';
import { FolderPlanner } from '../project_builder/FolderPlanner';
import { BackendPlanner } from '../project_builder/BackendPlanner';
import { FrontendPlanner } from '../project_builder/FrontendPlanner';
import { DatabasePlanner } from '../project_builder/DatabasePlanner';
import { AuthenticationPlanner } from '../project_builder/AuthenticationPlanner';
import { APIPlanner } from '../project_builder/APIPlanner';
import { AdminPanelPlanner } from '../project_builder/AdminPanelPlanner';
import { MobilePlanner } from '../project_builder/MobilePlanner';
import { AITaskPlanner } from '../project_builder/AITaskPlanner';
import { TestingPlanner } from '../project_builder/TestingPlanner';
import { DeploymentPlanner } from '../project_builder/DeploymentPlanner';
import { ProjectDependencyGraph } from '../project_builder/ProjectDependencyGraph';
import { BuildPipelinePlanner } from '../project_builder/BuildPipelinePlanner';
import { ProjectTimelinePlanner } from '../project_builder/ProjectTimelinePlanner';
import { RiskAssessmentPlanner } from '../project_builder/RiskAssessmentPlanner';
import { ProjectComplexityAnalyzer } from '../project_builder/ProjectComplexityAnalyzer';
import { SprintPlanner } from '../project_builder/SprintPlanner';
import { FeatureDependencyPlanner } from '../project_builder/FeatureDependencyPlanner';
import { CodingTaskGenerator } from '../project_builder/CodingTaskGenerator';
import { QualityGatePlanner } from '../project_builder/QualityGatePlanner';
import { CodeGenerationReadinessAnalyzer } from '../project_builder/CodeGenerationReadinessAnalyzer';
import { CodeGenerationEngine } from '../code_generation/CodeGenerationEngine';

import { LeadArchitectAgent } from '../ai_team/LeadArchitectAgent';
import { BackendDeveloperAgent } from '../ai_team/BackendDeveloperAgent';
import { FrontendDeveloperAgent } from '../ai_team/FrontendDeveloperAgent';
import { MobileDeveloperAgent } from '../ai_team/MobileDeveloperAgent';
import { DatabaseArchitectAgent } from '../ai_team/DatabaseArchitectAgent';
import { DevOpsEngineerAgent } from '../ai_team/DevOpsEngineerAgent';
import { SecurityEngineerAgent } from '../ai_team/SecurityEngineerAgent';
import { PerformanceEngineerAgent } from '../ai_team/PerformanceEngineerAgent';
import { QAEngineerAgent } from '../ai_team/QAEngineerAgent';
import { DocumentationEngineerAgent } from '../ai_team/DocumentationEngineerAgent';
import { UXReviewerAgent } from '../ai_team/UXReviewerAgent';
import { CodeReviewerAgent } from '../ai_team/CodeReviewerAgent';
import { RefactoringAgent } from '../ai_team/RefactoringAgent';
import { BugHunterAgent } from '../ai_team/BugHunterAgent';
import { StaticAnalysisAgent } from '../ai_team/StaticAnalysisAgent';
import { DependencyAuditAgent } from '../ai_team/DependencyAuditAgent';
import { AIProjectManager } from '../ai_team/AIProjectManager';
import { TeamCoordinator } from '../ai_team/TeamCoordinator';
import { ConflictResolver } from '../ai_team/ConflictResolver';
import { ReviewBoard } from '../ai_team/ReviewBoard';
import { AITeamMetrics } from '../ai_team/AITeamMetrics';
import { AITeamReport } from '../ai_team/AITeamReport';
import { AITeamEngine } from '../ai_team/AITeamEngine';


export function bootstrapServices(): void {
  // 1. Core utilities
  const aiOrchestrator = new AIOrchestrator();
  const planner = new Planner();
  const toolManager = new ToolManager();
  
  // Register tools
  toolManager.registerTool(new TaskTool());
  toolManager.registerTool(new ReminderTool());
  toolManager.registerTool(new MemoryTool());
  toolManager.registerTool(new NotificationTool());
  toolManager.registerTool(new WeatherTool());
  toolManager.registerTool(new GoalTool());
  toolManager.registerTool(new WorkflowTool());
  toolManager.registerTool(new CameraTool());
  toolManager.registerTool(new CalendarTool());
  toolManager.registerTool(new DosyaTool());
  toolManager.registerTool(new MapsTool());

  const shortTermMemory = new ShortTermMemory();
  const longTermMemory = new LongTermMemory();
  const conversationEngine = new ConversationEngine(aiOrchestrator);
  const lifeModel = new LifeModel();
  const proactiveEngine = new ProactiveEngine();

  // Register agents
  agentRegistry.register(new GoalAgent());
  agentRegistry.register(new HealthAgent());
  agentRegistry.register(new FitnessAgent());
  agentRegistry.register(new WorkAgent());
  agentRegistry.register(new LearningAgent());
  agentRegistry.register(new NotificationAgent());

  container.register('AIOrchestrator', aiOrchestrator);
  container.register('Planner', planner);
  container.register('ToolManager', toolManager);
  container.register('ShortTermMemory', shortTermMemory);
  container.register('LongTermMemory', longTermMemory);
  container.register('ConversationEngine', conversationEngine);
  container.register('LifeModel', lifeModel);
  container.register('ProactiveEngine', proactiveEngine);
  container.register('GoalEngine', goalEngine);
  const workflowPlanner = new WorkflowPlannerCore();
  const workflowScheduler = new WorkflowScheduler();
  const workflowExecutor = new WorkflowExecutor();
  const workflowStateManager = new WorkflowStateManager();
  const workflowRecovery = new WorkflowRecoveryEngine();
  const workflowOptimization = new WorkflowOptimizationEngine();
  const workflowMetrics = new WorkflowMetrics();
  const workflowHistory = new WorkflowHistory();
  const workflowReplay = new WorkflowReplayEngine();
  const workflowTemplateLibrary = new WorkflowTemplateLibrary();
  const workflowDesigner = new WorkflowDesigner();
  const workflowDependencyGraph = new WorkflowDependencyGraph();
  const workflowVersionManager = new WorkflowVersionManager();
  const workflowHealthEngine = new WorkflowHealthEngine(workflowStateManager);

  const workflowEngine = new WorkflowEngine(
    workflowPlanner,
    workflowScheduler,
    workflowExecutor,
    workflowStateManager,
    workflowRecovery,
    workflowOptimization,
    workflowMetrics,
    workflowHistory
  );

  container.register('WorkflowEngine', workflowEngine);
  container.register('WorkflowPlanner', workflowPlanner);
  container.register('WorkflowScheduler', workflowScheduler);
  container.register('WorkflowExecutor', workflowExecutor);
  container.register('WorkflowStateManager', workflowStateManager);
  container.register('WorkflowRecoveryEngine', workflowRecovery);
  container.register('WorkflowOptimizationEngine', workflowOptimization);
  container.register('WorkflowMetrics', workflowMetrics);
  container.register('WorkflowHistory', workflowHistory);
  container.register('WorkflowReplayEngine', workflowReplay);
  container.register('WorkflowTemplateLibrary', workflowTemplateLibrary);
  container.register('WorkflowDesigner', workflowDesigner);
  container.register('WorkflowDependencyGraph', workflowDependencyGraph);
  container.register('WorkflowVersionManager', workflowVersionManager);
  container.register('WorkflowHealthEngine', workflowHealthEngine);
  container.register('WorkflowReportEngine', new WorkflowReportEngine());
  container.register('WorkflowDecisionEngine', new WorkflowDecisionEngine());
  container.register('WorkflowSimulationEngine', new WorkflowSimulationEngine());
  container.register('WorkflowAnalyticsEngine', new WorkflowAnalyticsEngine());
  container.register('WorkflowAIOptimizer', new WorkflowAIOptimizer());
  container.register('WorkflowCostEngine', new WorkflowCostEngine());
  container.register('WorkflowPredictionEngine', new WorkflowPredictionEngine());
  container.register('WorkflowAutoOptimizer', new WorkflowAutoOptimizer());

  container.register('AgentManager', agentManager);
  container.register('MultiAgentEngine', multiAgentEngine);
  container.register('LearningEngine', new NewLearningEngine());
  container.register('ObservabilityCenter', observabilityCenter);
  container.register('ToolIntelligenceEngine', toolIntelligenceEngine);
  container.register('PlanningEngine', planningEngine);
  container.register('ReasoningEngine', reasoningEngine);
  container.register('KnowledgeEngine', knowledgeEngine);
  container.register('VisionEngine', visionEngine);
  container.register('CognitiveLearningEngine', cognitiveLearningEngine);
  container.register('AutonomousExecutiveEngine', autonomousExecutiveEngine);
  container.register('BackupService', backupService);
  container.register('RestoreService', restoreService);
  container.register('RecoveryMode', recoveryMode);
  container.register('BackupDiagnostics', backupDiagnostics);
  container.register('ReleaseManager', releaseManager);
  container.register('ReleaseDiagnostics', releaseDiagnostics);
  container.register('VersionManager', versionManager);
  container.register('ArchitectureHistory', architectureHistory);
  container.register('BackupEncryption', backupEncryption);
  container.register('BackupSignature', backupSignature);
  container.register('BackupVerifier', backupVerifier);
  container.register('SchemaVersionManager', schemaVersionManager);
  container.register('MigrationEngine', migrationEngine);
  container.register('ProjectHealthEngine', projectHealthEngine);
  container.register('RecoveryCenter', recoveryCenter);
  container.register('AuditTrail', auditTrail);
  container.register('IntegrityScanner', integrityScanner);
  container.register('ProjectFingerprint', projectFingerprint);
  container.register('ArchitectureSnapshot', architectureSnapshot);
  container.register('DependencyScanner', dependencyScanner);
  container.register('QualityGate', qualityGate);
  container.register('ChangelogGenerator', changelogGenerator);
  container.register('ArchitectureIndex', architectureIndex);
  container.register('RepositoryIntelligenceEngine', repositoryIntelligenceEngine);
  container.register('CodeIntelligenceEngine', codeIntelligenceEngine);
  container.register('DeveloperAgent', developerAgent);
  container.register('CodeGenerationEngine', codeGenerationEngine);
  container.register('PatchApplicationEngine', patchApplicationEngine);
  container.register('PatchReviewer', patchReviewer);
  container.register('PatchValidator', patchValidator);
  container.register('RollbackManager', rollbackManager);
  container.register('SandboxWorkspace', sandboxWorkspace);
  container.register('ApplyPreparationEngine', applyPreparationEngine);
  container.register('ApplyPreparationReport', applyPreparationReport);
  container.register('ApplyReadinessValidator', applyReadinessValidator);
  container.register('CompilePreviewEngine', compilePreviewEngine);
  container.register('RegressionPreviewRunner', regressionPreviewRunner);
  container.register('ReadinessScoreEngine', readinessScoreEngine);
  container.register('ApplyPreviewEngine', applyPreviewEngine);
  container.register('ReadyToApplyManifest', readyToApplyManifest);
  container.register('ApprovalPackageBuilder', approvalPackageBuilder);
  container.register('AICodingOrchestrator', aiCodingOrchestrator);
  container.register('ProviderRegistry', providerRegistry);
  container.register('ProviderSelector', providerSelector);
  container.register('PromptCompiler', promptCompiler);
  container.register('ContextAssembler', contextAssembler);
  container.register('ModelRoutingEngine', modelRoutingEngine);
  container.register('LLMExecutionEngine', llmExecutionEngine);
  container.register('LLMRuntime', llmRuntime);
  container.register('ResponseValidator', responseValidator);
  container.register('ResponseNormalizer', responseNormalizer);
  container.register('ExecutionMetrics', executionMetrics);
  container.register('LLMExecutionReport', llmExecutionReport);
  container.register('PromptExecutionHistory', promptExecutionHistory);
  container.register('AIConsensusEngine', aiConsensusEngine);
  container.register('ConsensusAnalyzer', consensusAnalyzer);
  container.register('ConflictResolver', conflictResolver);
  container.register('ConsensusMetrics', consensusMetrics);
  container.register('ConsensusMemory', consensusMemory);
  container.register('KnowledgeBaseEngine', knowledgeBaseEngine);
  container.register('KnowledgeSearchEngine', knowledgeSearchEngine);
  container.register('EngineeringKnowledgeGraph', engineeringKnowledgeGraph);
  container.register('SprintHistoryIndexer', sprintHistoryIndexer);
  container.register('KnowledgeMetrics', knowledgeMetrics);
  container.register('AutonomousTaskPlanner', autonomousTaskPlanner);
  container.register('TaskDecomposer', taskDecomposer);
  container.register('TaskDependencyGraph', taskDependencyGraph);
  container.register('ResourcePlanner', resourcePlanner);
  container.register('ExecutionRoadmap', executionRoadmap);
  container.register('AutonomousCodingEngine', autonomousCodingEngine);
  container.register('FrameworkDetector', frameworkDetector);
  container.register('CodeReuseAnalyzer', codeReuseAnalyzer);
  container.register('SelfVerificationEngine', selfVerificationEngine);
  container.register('EngineeringStandardsEngine', engineeringStandardsEngine);
  container.register('AutonomousTestingEngine', autonomousTestingEngine);
  container.register('TestStrategyPlanner', testStrategyPlanner);
  container.register('UnitTestGenerator', unitTestGenerator);
  container.register('IntegrationTestGenerator', integrationTestGenerator);
  container.register('APITestGenerator', apiTestGenerator);
  container.register('UITestGenerator', uiTestGenerator);
  container.register('RegressionTestPlanner', regressionTestPlanner);
  container.register('EdgeCaseGenerator', edgeCaseGenerator);
  container.register('MockDataGenerator', mockDataGenerator);
  container.register('CoverageAnalyzer', coverageAnalyzer);
  container.register('MutationTestingEngine', mutationTestingEngine);
  container.register('FailureAnalyzer', failureAnalyzer);
  container.register('TestQualityEngine', testQualityEngine);
  container.register('AITestReviewEngine', aiTestReviewEngine);
  container.register('TestPrioritizationEngine', testPrioritizationEngine);
  container.register('TestSuiteOptimizer', testSuiteOptimizer);
  container.register('TestReportGenerator', testReportGenerator);
  container.register('SelfHealingAgent', selfHealingAgent);
  container.register('FailureClassifier', failureClassifier);
  container.register('ErrorLogParser', errorLogParser);
  container.register('RootCauseAnalyzer', rootCauseAnalyzer);
  container.register('RepairStrategyPlanner', repairStrategyPlanner);
  container.register('RepairPatchPlanner', repairPatchPlanner);
  container.register('RetryPolicyEngine', retryPolicyEngine);
  container.register('HealingLoopEngine', healingLoopEngine);
  container.register('HealingConfidenceScorer', healingConfidenceScorer);
  container.register('HealingHistory', healingHistory);
  container.register('HumanInterventionDetector', humanInterventionDetector);
  container.register('SelfHealingReport', selfHealingReport);

  // New self-healing registrations
  container.register('LiveDebugger', new LiveDebugger());
  container.register('ErrorClassifier', new ErrorClassifier());
  container.register('FixPlanner', new FixPlanner());
  container.register('PatchPlanner', new PatchPlanner());
  container.register('PatchValidator', new PatchValidator());
  container.register('HealingCoordinator', new HealingCoordinator());
  container.register('RegressionAnalyzer', new RegressionAnalyzer());
  container.register('DependencyRepairEngine', new DependencyRepairEngine());
  container.register('PerformanceRepairEngine', new PerformanceRepairEngine());
  container.register('SecurityRepairEngine', new SecurityRepairEngine());
  container.register('ArchitectureRepairEngine', new ArchitectureRepairEngine());
  container.register('TestFailureAnalyzer', new TestFailureAnalyzer());
  container.register('AIReasoningValidator', new AIReasoningValidator());
  container.register('ApprovalPackageGenerator', new ApprovalPackageGenerator());
  container.register('RollbackPlanner', new RollbackPlanner());
  container.register('SelfHealingMetrics', new SelfHealingMetrics());
  container.register('SelfHealingEngine', new SelfHealingEngine());

  // New Multi-Agent Collaboration 2.0 Registrations
  container.register('MultiAgentEngine', new NewMultiAgentEngine());
  container.register('AgentCommunicationBus', new NewAgentBus());
  container.register('ConversationManager', new NewConvMgr());
  container.register('ConsensusEngine', new NewConsensusEngine());
  container.register('NegotiationEngine', new NewNegEngine());
  container.register('TaskDistributionEngine', new NewTaskDistEngine());
  container.register('AgentMemory', new NewAgentMemory());
  container.register('SharedKnowledgeBase', new NewKnowledgeBase());
  container.register('CollaborationTimeline', new NewTimeline());
  container.register('CollaborationMetrics', new NewMetrics());
  container.register('ConflictManager', new NewConflictMgr());
  container.register('CollaborationReport', new NewReport());
  container.register('CollaborationEngine', new NewCollabEngine());
  container.register('AgentReputationEngine', new AgentReputationEngine());
  container.register('ReputationMetrics', new ReputationMetrics());
  container.register('MeetingRecorder', new MeetingRecorder());
  container.register('MeetingArchive', new MeetingArchive());
  container.register('MeetingReplayEngine', new MeetingReplayEngine());
  container.register('EngineeringKnowledgeEvolution', new EngineeringKnowledgeEvolution());

  // Sprint 6.6 Autonomous Execution Layer registrations
  container.register('SandboxEngine', new SandboxEngine());
  container.register('FileExecutionEngine', new FileExecutionEngine());
  container.register('ProjectExecutionEngine', new ProjectExecutionEngine());
  container.register('ExecutionPolicyEngine', new ExecutionPolicyEngine());
  container.register('ApprovalExecutionManager', new ApprovalExecutionManager());
  container.register('ExecutionCheckpointManager', new ExecutionCheckpointManager());
  container.register('RollbackExecutionEngine', new RollbackExecutionEngine());
  container.register('PatchExecutionEngine', new PatchExecutionEngine());
  container.register('GitExecutionEngine', new GitExecutionEngine());
  container.register('WorkspaceScanner', new WorkspaceScanner());
  container.register('ExecutionMonitor', new ExecutionMonitor());
  container.register('ExecutionMetrics', new ExecutionMetrics());
  container.register('ExecutionReport', new ExecutionReport());
  container.register('ExecutionEngine', new ExecutionEngine());

  // Sprint 6.7 Plugin Marketplace & Tool Ecosystem registrations
  const pluginSystemEngine = new PluginSystemEngine();
  container.register('PluginSystemEngine', pluginSystemEngine);
  container.register('PluginSystemRegistry', new PluginSystemRegistry());
  container.register('PluginSystemInstaller', new PluginSystemInstaller());
  container.register('PluginSystemLoader', new PluginSystemLoader());
  container.register('PluginSecurityScanner', new PluginSecurityScanner());
  container.register('PluginDependencyResolver', new PluginDependencyResolver());
  container.register('PluginSystemPermissionManager', new PluginSystemPermissionManager());
  container.register('PluginMarketplace', new PluginMarketplace());
  container.register('PluginUpdater', new PluginUpdater());
  container.register('PluginSystemMetrics', new PluginSystemMetrics());
  container.register('PluginReport', new PluginReport());

  // Sprint 6.7 Enterprise Addendum — Extended Plugin Ecosystem registrations
  container.register('PluginCertificationEngine', new PluginCertificationEngine());
  container.register('PluginSandboxManager', new PluginSandboxManager());
  container.register('PluginGateway', new PluginGateway());
  container.register('PluginSDK', new PluginSDK());
  container.register('PluginManifestValidator', new PluginManifestValidator());
  container.register('PluginAnalytics', new PluginAnalytics());
  container.register('PluginRecommendationEngine', new PluginRecommendationEngine());

  container.register('UIDesignerAgent', uiDesignerAgent);
  container.register('VisualDesignerStudio', visualDesignerStudio);
  container.register('StudioWorkspace', studioWorkspace);
  container.register('ResourceManager', resourceManager);
  container.register('VisualBuilderEngine', visualBuilderEngine);
  container.register('DragDropEngine', new DragDropEngine());
  container.register('PropertyInspector', new PropertyInspector());
  container.register('BuilderPreviewEngine', new BuilderPreviewEngine());
  container.register('AIVisualCommandEngine', new AIVisualCommandEngine());
  container.register('TechnologyArchitect', technologyArchitect);
  container.register('FrameworkSelector', technologyArchitect.getFrameworkSelector());
  container.register('UniversalCodeGenerationEngine', universalCodeGenerationEngine);
  container.register('UniversalProjectGenerator', universalCodeGenerationEngine.getProjGenerator());
  container.register('LanguageTemplateRegistry', universalCodeGenerationEngine.getLangRegistry());
  container.register('FrameworkTemplateRegistry', universalCodeGenerationEngine.getFwRegistry());
  container.register('DependencyResolver', universalCodeGenerationEngine.getDepResolver());
  container.register('ProjectValidatorV2', universalCodeGenerationEngine.getValidator());
  container.register('ExperienceEngine', experienceEngine);
  container.register('MONIBrain', moniBrain);
  container.register('ProjectMemory', moniBrain.getMemory());
  container.register('DecisionMemory', moniBrain.getDecisions());
  container.register('KnowledgeGraph', moniBrain.getGraph());
  container.register('ContextBuilder', moniBrain.getContextBuilder());
  container.register('MemorySearchEngine', moniBrain.getSearchEngine());
  container.register('BrainReasoningEngine', moniBrain.getReasoning());

  // MONI OS Orchestrator registrations
  const eventBusOSInstance = new EventBus();
  const stateManagerOSInstance = new StateManager();
  const engineLifecycleManagerOSInstance = new EngineLifecycleManager();
  const systemDiagnosticsOSInstance = new SystemDiagnostics();
  const operatingSystemKernel = new OperatingSystemKernel(
    stateManagerOSInstance,
    engineLifecycleManagerOSInstance,
    systemDiagnosticsOSInstance
  );
  const engineRegistryOSInstance = new EngineRegistry();
  const workflowPlannerOSInstance = new WorkflowPlanner();
  const taskSchedulerOSInstance = new TaskScheduler();
  const dependencyResolverOSInstance = new DependencyResolverOS();
  const executionCoordinatorOSInstance = new ExecutionCoordinator();
  const approvalGateManagerOSInstance = new ApprovalGateManager();
  const resourceAllocatorOSInstance = new ResourceAllocator();
  const healthMonitorOSInstance = new HealthMonitor();
  const recoveryCoordinatorOSInstance = new RecoveryCoordinator();
  const operatingSystemMetricsOSInstance = new OperatingSystemMetrics();
  const operatingSystemReportOSInstance = new OperatingSystemReport();

  const moniOS = new MONIOperatingSystem(
    operatingSystemKernel,
    engineRegistryOSInstance,
    engineLifecycleManagerOSInstance,
    workflowPlannerOSInstance,
    taskSchedulerOSInstance,
    dependencyResolverOSInstance,
    executionCoordinatorOSInstance,
    approvalGateManagerOSInstance,
    eventBusOSInstance,
    stateManagerOSInstance,
    resourceAllocatorOSInstance,
    healthMonitorOSInstance,
    recoveryCoordinatorOSInstance,
    systemDiagnosticsOSInstance,
    operatingSystemMetricsOSInstance,
    operatingSystemReportOSInstance
  );

  container.register('MONIOperatingSystem', moniOS);
  container.register('OperatingSystemKernel', operatingSystemKernel);
  container.register('EngineRegistry', engineRegistryOSInstance);
  container.register('EngineLifecycleManager', engineLifecycleManagerOSInstance);
  container.register('WorkflowPlanner', workflowPlannerOSInstance);
  container.register('TaskScheduler', taskSchedulerOSInstance);
  container.register('ExecutionCoordinator', executionCoordinatorOSInstance);
  container.register('EventBus', eventBusOSInstance);
  container.register('StateManager', stateManagerOSInstance);
  container.register('ResourceAllocator', resourceAllocatorOSInstance);
  container.register('HealthMonitor', healthMonitorOSInstance);
  container.register('RecoveryCoordinator', recoveryCoordinatorOSInstance);

  const pluginManagerOSInstance = new PluginManager();
  const permissionManagerOSInstance = new PermissionManager();
  const workflowRecorderOSInstance = new WorkflowRecorder();
  const sessionManagerOSInstance = new SessionManager();
  const moniOSAPIInstance = new MONIOSAPI();

  container.register('PluginManager', pluginManagerOSInstance);
  container.register('PermissionManager', permissionManagerOSInstance);
  container.register('WorkflowRecorder', workflowRecorderOSInstance);
  container.register('SessionManager', sessionManagerOSInstance);
  container.register('MONIOSAPI', moniOSAPIInstance);

  const autonomousProjectBuilderInstance = new AutonomousProjectBuilder();
  const projectBuilderInstance = new ProjectBuilder();
  const projectScaffolderInstance = new ProjectScaffolder();
  const projectBuilderReportInstance = new ProjectBuilderReport();
  const modulePlannerInstance = new ModulePlanner();
  const folderPlannerInstance = new FolderPlanner();
  const backendPlannerInstance = new BackendPlanner();
  const frontendPlannerInstance = new FrontendPlanner();
  const databasePlannerInstance = new DatabasePlanner();
  const authPlannerInstance = new AuthenticationPlanner();
  const apiPlannerInstance = new APIPlanner();
  const adminPlannerInstance = new AdminPanelPlanner();
  const mobilePlannerInstance = new MobilePlanner();
  const aiTaskPlannerInstance = new AITaskPlanner();
  const testingPlannerInstance = new TestingPlanner();
  const deploymentPlannerInstance = new DeploymentPlanner();
  const dependencyGraphInstance = new ProjectDependencyGraph();
  const buildPipelinePlannerInstance = new BuildPipelinePlanner();
  const timelinePlannerInstance = new ProjectTimelinePlanner();
  const riskAssessmentInstance = new RiskAssessmentPlanner();
  const complexityAnalyzerInstance = new ProjectComplexityAnalyzer();
  const sprintPlannerInstance = new SprintPlanner();
  const featureDependencyPlannerInstance = new FeatureDependencyPlanner();
  const codingTaskGeneratorInstance = new CodingTaskGenerator();
  const qualityGatePlannerInstance = new QualityGatePlanner();
  const readinessAnalyzerInstance = new CodeGenerationReadinessAnalyzer();

  container.register('AutonomousProjectBuilder', autonomousProjectBuilderInstance);
  container.register('ProjectBuilder', projectBuilderInstance);
  container.register('ProjectScaffolder', projectScaffolderInstance);
  container.register('ProjectBuilderReport', projectBuilderReportInstance);
  container.register('ModulePlanner', modulePlannerInstance);
  container.register('FolderPlanner', folderPlannerInstance);
  container.register('BackendPlanner', backendPlannerInstance);
  container.register('FrontendPlanner', frontendPlannerInstance);
  container.register('DatabasePlanner', databasePlannerInstance);
  container.register('AuthenticationPlanner', authPlannerInstance);
  container.register('APIPlanner', apiPlannerInstance);
  container.register('AdminPanelPlanner', adminPlannerInstance);
  container.register('MobilePlanner', mobilePlannerInstance);
  container.register('AITaskPlanner', aiTaskPlannerInstance);
  container.register('TestingPlanner', testingPlannerInstance);
  container.register('DeploymentPlanner', deploymentPlannerInstance);
  container.register('ProjectDependencyGraph', dependencyGraphInstance);
  container.register('BuildPipelinePlanner', buildPipelinePlannerInstance);
  container.register('ProjectTimelinePlanner', timelinePlannerInstance);
  container.register('RiskAssessmentPlanner', riskAssessmentInstance);
  container.register('ProjectComplexityAnalyzer', complexityAnalyzerInstance);
  container.register('SprintPlanner', sprintPlannerInstance);
  container.register('FeatureDependencyPlanner', featureDependencyPlannerInstance);
  container.register('CodingTaskGenerator', codingTaskGeneratorInstance);
  container.register('QualityGatePlanner', qualityGatePlannerInstance);
  container.register('CodeGenerationReadinessAnalyzer', readinessAnalyzerInstance);

  const codeGenerationEngineInstance = new CodeGenerationEngine();
  container.register('CodeGenerationEngine', codeGenerationEngineInstance);

  // AI Team registrations
  container.register('LeadArchitectAgent', new LeadArchitectAgent());
  container.register('BackendDeveloperAgent', new BackendDeveloperAgent());
  container.register('FrontendDeveloperAgent', new FrontendDeveloperAgent());
  container.register('MobileDeveloperAgent', new MobileDeveloperAgent());
  container.register('DatabaseArchitectAgent', new DatabaseArchitectAgent());
  container.register('DevOpsEngineerAgent', new DevOpsEngineerAgent());
  container.register('SecurityEngineerAgent', new SecurityEngineerAgent());
  container.register('PerformanceEngineerAgent', new PerformanceEngineerAgent());
  container.register('QAEngineerAgent', new QAEngineerAgent());
  container.register('DocumentationEngineerAgent', new DocumentationEngineerAgent());
  container.register('UXReviewerAgent', new UXReviewerAgent());
  container.register('CodeReviewerAgent', new CodeReviewerAgent());
  container.register('RefactoringAgent', new RefactoringAgent());
  container.register('BugHunterAgent', new BugHunterAgent());
  container.register('StaticAnalysisAgent', new StaticAnalysisAgent());
  container.register('DependencyAuditAgent', new DependencyAuditAgent());

  container.register('AIProjectManager', new AIProjectManager());
  container.register('TeamCoordinator', new TeamCoordinator());
  container.register('ConflictResolver', new ConflictResolver());
  container.register('ReviewBoard', new ReviewBoard());
  container.register('AITeamMetrics', new AITeamMetrics());
  container.register('AITeamReport', new AITeamReport());
  container.register('AITeamEngine', new AITeamEngine());

  // Sprint 6.8 Security Registrations
  container.register('SecurityPolicyManager', new SecurityPolicyManager());
  container.register('ThreatDetectionEngine', new ThreatDetectionEngine());
  container.register('VulnerabilityRemediationAgent', new VulnerabilityRemediationAgent());
  container.register('SecretsManagementSimulator', new SecretsManagementSimulator());
  container.register('RbacEnforcer', new RbacEnforcer());
  container.register('ComplianceAuditEngine', new ComplianceAuditEngine());
  container.register('SecurityReportEngine', new SecurityReportEngine());

  // 2. Audio Engine
  const speechSynthesizer = new SpeechSynthesizer();
  const speechRecognizer = new SpeechRecognizer();
  container.register('SpeechSynthesizer', speechSynthesizer);
  container.register('SpeechRecognizer', speechRecognizer);

  // 3. Executive Brain orchestrator
  const executiveBrain = new ExecutiveBrain(
    aiOrchestrator,
    toolManager,
    shortTermMemory,
    longTermMemory
  );
  container.register('ExecutiveBrain', executiveBrain);

  // 4. Load plugins asynchronously
  pluginManager.installAndLoad(new SpotifyPlugin()).catch(err => {
    console.error('[Bootstrap] Failed to load SpotifyPlugin:', err);
  });

  console.log('[Bootstrap] Services registered successfully.');
}

