import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';

export class DatabaseSelector {
  public selectDatabase(requirements: ProjectRequirements): DecisionOutcome {
    const reasons: string[] = [];
    let db = 'PostgreSQL';
    let confidence = 85;

    if (requirements.securityRequirements.includes('encryption_at_rest') && !requirements.securityRequirements.includes('rbac')) {
      db = 'PostgreSQL';
      confidence = 95;
      reasons.push('PostgreSQL offers ACID compliance and handles complex relational query transactions.', 'Native support for row-level security (RLS) and SSL transport encryption.');
    } else if (requirements.offlineModeNeeded && requirements.category === 'mobile_app') {
      db = 'SQLite';
      confidence = 90;
      reasons.push('SQLite is embedded and serverless, perfect for local mobile storage.', 'Zero latency offline data operations.');
    } else if (requirements.scalabilityNeed === 'high') {
      db = 'PostgreSQL';
      confidence = 95;
      reasons.push('PostgreSQL offers ACID compliance and handles complex relational query transactions.', 'Native support for row-level security (RLS) and SSL transport encryption.');
    } else if (requirements.businessDomain === 'ai_assistant') {
      db = 'Supabase';
      confidence = 88;
      reasons.push('Supabase combines PostgreSQL with vector extensions (pgvector) for embedding lookups.', 'Built-in real-time listener subscriptions.');
    } else {
      reasons.push('PostgreSQL is the most stable and feature-rich relational engine.', 'Easy scaling paths through containerization.');
    }

    return {
      selection: db,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
