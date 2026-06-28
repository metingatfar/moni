// ===================================================================
// MONI Sprint 6.7 Enterprise Addendum — PluginRecommendationEngine.ts
// Automatically recommends plugins based on project context.
// ===================================================================

export interface PluginRecommendation {
  pluginId: string;
  name: string;
  reason: string;
  confidence: number;
  category: string;
  relevanceScore: number;
  basedOn: string[];
}

export interface ProjectContext {
  projectType: string;
  technologies: string[];
  frameworks: string[];
  databases: string[];
  cloudProviders: string[];
  languages: string[];
  features: string[];
}

export interface RecommendationResult {
  projectContext: ProjectContext;
  recommendations: PluginRecommendation[];
  generatedAt: string;
  totalSuggestions: number;
  aiConfidence: number;
}

interface PluginPattern {
  pluginId: string;
  name: string;
  category: string;
  triggers: string[];
}

const PLUGIN_PATTERNS: PluginPattern[] = [
  // AI/ML
  { pluginId: 'moni-openai-provider', name: 'OpenAI Provider', category: 'ai-provider', triggers: ['ai', 'openai', 'gpt', 'chatgpt', 'llm', 'nlp', 'machine-learning'] },
  { pluginId: 'moni-anthropic-provider', name: 'Anthropic Claude', category: 'ai-provider', triggers: ['ai', 'claude', 'anthropic', 'llm'] },
  { pluginId: 'moni-ollama-provider', name: 'Ollama Local AI', category: 'ai-provider', triggers: ['ai', 'ollama', 'local-ai', 'self-hosted'] },
  { pluginId: 'moni-langchain-toolkit', name: 'LangChain Toolkit', category: 'ai-provider', triggers: ['ai', 'langchain', 'rag', 'agents', 'chains'] },
  // Databases
  { pluginId: 'moni-postgres-connector', name: 'PostgreSQL Connector', category: 'database', triggers: ['postgresql', 'postgres', 'sql', 'database', 'erp', 'enterprise'] },
  { pluginId: 'moni-mongodb-connector', name: 'MongoDB Connector', category: 'database', triggers: ['mongodb', 'nosql', 'document-db'] },
  { pluginId: 'moni-redis-connector', name: 'Redis Connector', category: 'database', triggers: ['redis', 'cache', 'session', 'queue', 'erp'] },
  { pluginId: 'moni-supabase-connector', name: 'Supabase Connector', category: 'database', triggers: ['supabase', 'firebase-alternative', 'realtime', 'fitness', 'mobile'] },
  // Cloud
  { pluginId: 'moni-aws-cloud', name: 'AWS Cloud Platform', category: 'cloud-platform', triggers: ['aws', 'amazon', 'ec2', 's3', 'lambda', 'cloud'] },
  { pluginId: 'moni-gcp-cloud', name: 'Google Cloud Platform', category: 'cloud-platform', triggers: ['gcp', 'google-cloud', 'firebase', 'cloud'] },
  { pluginId: 'moni-azure-cloud', name: 'Azure Cloud Platform', category: 'cloud-platform', triggers: ['azure', 'microsoft', 'cloud'] },
  // Deployment
  { pluginId: 'moni-docker-deploy', name: 'Docker Deployment', category: 'deployment', triggers: ['docker', 'container', 'devops', 'deployment'] },
  { pluginId: 'moni-kubernetes-deploy', name: 'Kubernetes Orchestrator', category: 'deployment', triggers: ['kubernetes', 'k8s', 'orchestration', 'erp', 'microservices'] },
  // Frameworks
  { pluginId: 'moni-flutter-toolkit', name: 'Flutter Toolkit', category: 'developer-utility', triggers: ['flutter', 'dart', 'mobile', 'cross-platform', 'fitness'] },
  { pluginId: 'moni-react-toolkit', name: 'React Toolkit', category: 'developer-utility', triggers: ['react', 'nextjs', 'frontend', 'web'] },
  { pluginId: 'moni-fastapi-toolkit', name: 'FastAPI Toolkit', category: 'developer-utility', triggers: ['fastapi', 'python', 'api', 'backend', 'fitness'] },
  { pluginId: 'moni-nestjs-toolkit', name: 'NestJS Toolkit', category: 'developer-utility', triggers: ['nestjs', 'node', 'typescript', 'backend', 'enterprise'] },
  // Communication
  { pluginId: 'moni-rabbitmq-connector', name: 'RabbitMQ Connector', category: 'communication', triggers: ['rabbitmq', 'message-queue', 'amqp', 'erp', 'microservices'] },
  { pluginId: 'moni-slack-integration', name: 'Slack Integration', category: 'communication', triggers: ['slack', 'notifications', 'team', 'communication'] },
  // Testing
  { pluginId: 'moni-jest-runner', name: 'Jest Test Runner', category: 'testing', triggers: ['jest', 'testing', 'unit-test', 'react'] },
  { pluginId: 'moni-cypress-e2e', name: 'Cypress E2E', category: 'testing', triggers: ['cypress', 'e2e', 'integration-test', 'browser-test'] },
  // Monitoring
  { pluginId: 'moni-prometheus-monitor', name: 'Prometheus Monitoring', category: 'monitoring', triggers: ['prometheus', 'grafana', 'monitoring', 'metrics', 'enterprise'] },
  { pluginId: 'moni-sentry-monitor', name: 'Sentry Error Tracking', category: 'monitoring', triggers: ['sentry', 'error-tracking', 'crash-reporting'] },
  // Security
  { pluginId: 'moni-sso-enterprise', name: 'Enterprise SSO', category: 'security', triggers: ['sso', 'saml', 'oidc', 'authentication', 'enterprise'] },
  { pluginId: 'moni-vault-secrets', name: 'Vault Secret Manager', category: 'security', triggers: ['vault', 'secrets', 'security', 'enterprise'] },
];

const PROJECT_TEMPLATES: { type: string; technologies: string[] }[] = [
  { type: 'fitness', technologies: ['flutter', 'supabase', 'fastapi', 'docker', 'mobile'] },
  { type: 'erp', technologies: ['postgresql', 'kubernetes', 'redis', 'rabbitmq', 'enterprise'] },
  { type: 'ai', technologies: ['ai', 'openai', 'ollama', 'langchain', 'python'] },
  { type: 'ecommerce', technologies: ['react', 'postgresql', 'redis', 'docker', 'aws'] },
  { type: 'saas', technologies: ['react', 'nestjs', 'postgresql', 'docker', 'aws', 'sso'] },
  { type: 'mobile', technologies: ['flutter', 'firebase', 'fastapi', 'mobile'] },
  { type: 'microservices', technologies: ['docker', 'kubernetes', 'rabbitmq', 'prometheus', 'redis'] },
];

export class PluginRecommendationEngine {
  private recommendationHistory: RecommendationResult[] = [];

  recommend(context: ProjectContext): RecommendationResult {
    const allKeywords = [
      ...context.technologies,
      ...context.frameworks,
      ...context.databases,
      ...context.cloudProviders,
      ...context.languages,
      ...context.features,
      context.projectType,
    ].map(k => k.toLowerCase());

    const scored: Map<string, { pattern: PluginPattern; score: number; reasons: string[] }> = new Map();

    for (const pattern of PLUGIN_PATTERNS) {
      let matchScore = 0;
      const reasons: string[] = [];

      for (const trigger of pattern.triggers) {
        if (allKeywords.some(k => k.includes(trigger) || trigger.includes(k))) {
          matchScore += 20;
          reasons.push(`Matches technology: ${trigger}`);
        }
      }

      // Boost by project type template
      const template = PROJECT_TEMPLATES.find(t => t.type === context.projectType.toLowerCase());
      if (template) {
        for (const tech of template.technologies) {
          if (pattern.triggers.includes(tech)) {
            matchScore += 15;
            reasons.push(`Recommended for ${context.projectType} projects`);
          }
        }
      }

      if (matchScore > 0) {
        scored.set(pattern.pluginId, { pattern, score: Math.min(100, matchScore), reasons });
      }
    }

    const recommendations: PluginRecommendation[] = Array.from(scored.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 10)
      .map(([pluginId, data]) => ({
        pluginId,
        name: data.pattern.name,
        reason: data.reasons[0] || 'General recommendation',
        confidence: data.score / 100,
        category: data.pattern.category,
        relevanceScore: data.score,
        basedOn: data.reasons,
      }));

    const result: RecommendationResult = {
      projectContext: context,
      recommendations,
      generatedAt: new Date().toISOString(),
      totalSuggestions: recommendations.length,
      aiConfidence: recommendations.length > 0
        ? recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length
        : 0,
    };

    this.recommendationHistory.push(result);
    console.log(`[PluginRecommendationEngine] Generated ${recommendations.length} recommendations for ${context.projectType} project`);
    return result;
  }

  recommendForProjectType(projectType: string): RecommendationResult {
    const template = PROJECT_TEMPLATES.find(t => t.type === projectType.toLowerCase());
    const context: ProjectContext = {
      projectType,
      technologies: template?.technologies || [],
      frameworks: [],
      databases: [],
      cloudProviders: [],
      languages: [],
      features: [],
    };
    return this.recommend(context);
  }

  getRecommendationHistory(): RecommendationResult[] {
    return [...this.recommendationHistory];
  }

  getSupportedProjectTypes(): string[] {
    return PROJECT_TEMPLATES.map(t => t.type);
  }

  getAvailablePluginPatterns(): PluginPattern[] {
    return [...PLUGIN_PATTERNS];
  }

  getDiagnostics(): any {
    return {
      totalRecommendations: this.recommendationHistory.length,
      availablePatterns: PLUGIN_PATTERNS.length,
      supportedProjectTypes: this.getSupportedProjectTypes().length,
      averageConfidence: this.recommendationHistory.length > 0
        ? this.recommendationHistory.reduce((s, r) => s + r.aiConfidence, 0) / this.recommendationHistory.length
        : 0,
    };
  }
}
