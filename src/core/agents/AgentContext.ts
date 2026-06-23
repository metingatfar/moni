export interface AgentContext {
  userInput: string;
  conversationContext: any;
  lifeSnapshot: any;
  memoryFacts: any[];
  activeGoals: string[];
  currentDateTime: string;
  personalityMode: string;
  source: string;
}
