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
import { workflowEngine } from '../workflows/WorkflowEngine';
import { multiAgentEngine } from '../collaboration/MultiAgentEngine';
import { learningEngine } from '../learning/LearningEngine';
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
  container.register('WorkflowEngine', workflowEngine);
  container.register('AgentManager', agentManager);
  container.register('MultiAgentEngine', multiAgentEngine);
  container.register('LearningEngine', learningEngine);
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

