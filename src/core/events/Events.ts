export type MONIEventType = 
  | 'TaskAdded'
  | 'ReminderCreated'
  | 'MemorySaved'
  | 'ConversationCompleted'
  | 'SpeechStarted'
  | 'SpeechStopped'
  | 'ProviderChanged'
  | 'HealthUpdated'
  | 'ToolExecuted'
  | 'ToolFailed'
  | 'PipelineStarted'
  | 'PipelineCompleted'
  | 'PipelineFailed'
  | 'LegacyFallbackUsed'
  | 'MemoryUpdated'
  | 'MemoryDeleted'
  | 'MemoryUsed'
  | 'PersonalityModeChanged'
  | 'AgentSelected'
  | 'AgentExecuted'
  | 'AgentFailed'
  | 'AgentNeedsConfirmation'
  | 'AgentToolCallSuggested'
  | 'MultiAgentStarted'
  | 'AgentVoteCreated'
  | 'ConsensusCompleted'
  | 'MultiAgentFinished'
  | 'MultiAgentFallback'
  | 'ToolIntelligencePlanned';

export interface MONIEvent {
  type: MONIEventType;
  payload: any;
  timestamp: Date;
}

