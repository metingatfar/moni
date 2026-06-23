import { eventBus } from '../events/EventBus';

export interface MONIOState {
  activeProvider: 'gemini' | 'groq';
  isAudioQueueActive: boolean;
  latencyMap: Record<string, string>;
  memoryFactsCount: number;
  totalTokensUsed: number;
  lastCommandExecuted: string;
  lastToolExecuted: string;
  lastError: string;
  lastSuccess: string;
  pluginsLoadedCount: number;
  loadedPlugins: string[];
  eventCount: number;
  legacyFallbackCount: number;
}

export class StateManager {
  private static instance: StateManager;
  private state: MONIOState = {
    activeProvider: 'gemini',
    isAudioQueueActive: false,
    latencyMap: { gemini: '0ms', groq: '0ms', deepgram: '0ms', elevenlabs: '0ms', ExecutiveBrain: '0ms' },
    memoryFactsCount: 0,
    totalTokensUsed: 0,
    lastCommandExecuted: '',
    lastToolExecuted: '',
    lastError: '',
    lastSuccess: '',
    pluginsLoadedCount: 0,
    loadedPlugins: [],
    eventCount: 0,
    legacyFallbackCount: 0
  };

  private constructor() {
    // Listen to changes in EventBus to update state
    eventBus.subscribe('ProviderChanged', (e) => {
      this.state.activeProvider = e.payload;
      this.state.eventCount++;
    });
    eventBus.subscribe('TaskAdded', (e) => {
      this.state.lastCommandExecuted = `Task: ${e.payload.task || e.payload.title || ''}`;
      this.state.lastSuccess = 'Task added successfully.';
      this.state.eventCount++;
    });
    eventBus.subscribe('ReminderCreated', (e) => {
      this.state.lastCommandExecuted = `Reminder: ${e.payload.title || ''}`;
      this.state.lastSuccess = 'Reminder created successfully.';
      this.state.eventCount++;
    });
    eventBus.subscribe('MemorySaved', () => {
      this.state.memoryFactsCount++;
      this.state.lastCommandExecuted = 'Saved Memory';
      this.state.lastSuccess = 'Memory saved successfully.';
      this.state.eventCount++;
    });
    eventBus.subscribe('ToolExecuted', (e) => {
      this.state.lastToolExecuted = e.payload.name;
      this.state.lastSuccess = `Tool ${e.payload.name} executed successfully.`;
      this.state.eventCount++;
    });
    eventBus.subscribe('ToolFailed', (e) => {
      this.state.lastToolExecuted = e.payload.name;
      this.state.lastError = `Tool ${e.payload.name} failed: ${e.payload.error}`;
      this.state.eventCount++;
    });
    eventBus.subscribe('PipelineStarted', () => {
      this.state.eventCount++;
    });
    eventBus.subscribe('PipelineCompleted', () => {
      this.state.lastSuccess = `Pipeline finished successfully.`;
      this.state.eventCount++;
    });
    eventBus.subscribe('PipelineFailed', (e) => {
      this.state.lastError = `Pipeline failed: ${e.payload.error || e.payload}`;
      this.state.eventCount++;
    });
    eventBus.subscribe('LegacyFallbackUsed', (e) => {
      this.state.legacyFallbackCount++;
      this.state.lastError = `Fallback activated: ${e.payload.reason || ''}`;
      this.state.eventCount++;
    });
    eventBus.subscribe('HealthUpdated', () => {
      this.state.eventCount++;
    });
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  public getState(): MONIOState {
    return this.state;
  }

  public updateLatency(service: string, latency: string): void {
    this.state.latencyMap[service] = latency;
    eventBus.publish('HealthUpdated', { service, latency });
  }

  public recordTokenUsage(tokens: number): void {
    this.state.totalTokensUsed += tokens;
  }

  public recordToolExecution(toolName: string): void {
    this.state.lastToolExecuted = toolName;
  }

  public recordPluginLoaded(pluginName: string): void {
    this.state.pluginsLoadedCount++;
    if (!this.state.loadedPlugins.includes(pluginName)) {
      this.state.loadedPlugins.push(pluginName);
    }
  }
}

export const stateManager = StateManager.getInstance();

