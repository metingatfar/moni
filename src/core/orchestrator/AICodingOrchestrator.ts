import { providerRegistry } from './ProviderRegistry';
import { promptCompiler } from './PromptCompiler';
import { contextAssembler } from './ContextAssembler';
import { tokenBudgetManager } from './TokenBudgetManager';
import { costEstimator } from './CostEstimator';
import { modelRoutingEngine } from './ModelRoutingEngine';
import type { CompiledPrompt } from './PromptCompiler';
import type { TokenBudget } from './TokenBudgetManager';
import type { CostEstimate } from './CostEstimator';
import type { RoutingDecision } from './ModelRoutingEngine';

export interface OrchestrationResult {
  requestId: string;
  request: string;
  context: any;
  prompt: CompiledPrompt;
  routing: RoutingDecision;
  budget: TokenBudget;
  cost: CostEstimate;
  executionPlan: string;
}

export class AICodingOrchestrator {
  private routingRequests = 0;
  private compiledPrompts = 0;
  private providerSelections = 0;
  private contextAssemblies = 0;
  private tokenEstimations = 0;
  private costEstimations = 0;

  constructor() {
    this.registerMockProviders();
  }

  private registerMockProviders(): void {
    // Register Claude
    providerRegistry.registerProvider('Claude', {
      metadata: {
        name: 'Claude',
        version: '3.5 Sonnet',
        availability: 'online',
        limits: { maxInputTokens: 200000, maxOutputTokens: 8192 },
        status: 'active'
      },
      getCapabilities: () => ({ coding: 95, debugging: 90, architecture: 98, longContext: 85, ui: 90 })
    });

    // Register GPT
    providerRegistry.registerProvider('GPT', {
      metadata: {
        name: 'GPT',
        version: '4o',
        availability: 'online',
        limits: { maxInputTokens: 128000, maxOutputTokens: 4096 },
        status: 'active'
      },
      getCapabilities: () => ({ coding: 98, debugging: 95, architecture: 90, longContext: 75, ui: 95 })
    });

    // Register Gemini
    providerRegistry.registerProvider('Gemini', {
      metadata: {
        name: 'Gemini',
        version: '1.5 Pro',
        availability: 'online',
        limits: { maxInputTokens: 1000000, maxOutputTokens: 8192 },
        status: 'active'
      },
      getCapabilities: () => ({ coding: 88, debugging: 85, architecture: 88, longContext: 100, ui: 80 })
    });

    // Register Local Model
    providerRegistry.registerProvider('Local LLM', {
      metadata: {
        name: 'Local LLM',
        version: 'Llama 3 8B',
        availability: 'local',
        limits: { maxInputTokens: 8192, maxOutputTokens: 2048 },
        status: 'active'
      },
      getCapabilities: () => ({ coding: 70, debugging: 65, architecture: 60, longContext: 40, ui: 50 })
    });
  }

  public orchestrate(
    requestId: string,
    userInput: string,
    repoIntel: any,
    codeIntel: any,
    devPlan: any
  ): OrchestrationResult {
    console.log(`[AICodingOrchestrator] Orchestrating coding request: ${userInput}`);

    // 1. Context Assembly
    const context = contextAssembler.assembleContext(repoIntel, codeIntel, devPlan);
    this.contextAssemblies++;

    // 2. Prompt Compilation
    const prompt = promptCompiler.compilePrompt(
      userInput,
      context.repositorySummary,
      context.codeIntelligenceSummary,
      context.manifestSummary
    );
    this.compiledPrompts++;

    // 3. Routing Decision & Provider Selection
    const contextCharLength = context.repositorySummary.length + context.codeIntelligenceSummary.length + context.manifestSummary.length;
    const routing = modelRoutingEngine.routeRequest(userInput, contextCharLength, 'Medium');
    this.routingRequests++;
    this.providerSelections++;

    // 4. Token Footprint & Budget estimation
    const matchedProvider = providerRegistry.getProvider(routing.providerName) || providerRegistry.getProvider('Local LLM')!;
    const budget = tokenBudgetManager.estimateBudget(prompt.systemPrompt.length + prompt.userPrompt.length, contextCharLength, matchedProvider.metadata.limits.maxInputTokens);
    this.tokenEstimations++;

    // 5. Cost estimation
    const cost = costEstimator.estimateCost(routing.providerName, budget.inputTokensEstimated, budget.outputTokensEstimated);
    this.costEstimations++;

    return {
      requestId,
      request: userInput,
      context,
      prompt,
      routing,
      budget,
      cost,
      executionPlan: `Plan: Execute prompts on ${routing.providerName} in online context mode. Safe checks and dry-run execution will be scheduled post-generation.`
    };
  }

  public getDiagnostics(): Record<string, number> {
    return {
      routingRequests: this.routingRequests,
      compiledPrompts: this.compiledPrompts,
      providerSelections: this.providerSelections,
      contextAssemblies: this.contextAssemblies,
      tokenEstimations: this.tokenEstimations,
      costEstimations: this.costEstimations
    };
  }
}

export const aiCodingOrchestrator = new AICodingOrchestrator();
export default aiCodingOrchestrator;
