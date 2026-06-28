export interface ProjectRequirements {
  businessDomain: 'fitness' | 'ecommerce' | 'erp' | 'ai_assistant' | 'general';
  category: 'mobile_app' | 'web_portal' | 'backend_api' | 'desktop' | 'universal';
  scalabilityNeed: 'high' | 'medium' | 'low';
  estimatedTraffic: number; // requests/sec
  targetUsersCount: number;
  aiRequirements: string[];
  securityRequirements: string[];
  offlineModeNeeded: boolean;
  budgetUSD: number;
  complianceConstraints: string[];
}

export class RequirementAnalyzer {
  public static lastReq1: any = null;

  public analyzeRequirements(prompt: string): ProjectRequirements {
    const lower = prompt.toLowerCase();
    
    // Default requirements
    const req: ProjectRequirements = {
      businessDomain: 'general',
      category: 'web_portal',
      scalabilityNeed: 'medium',
      estimatedTraffic: 100,
      targetUsersCount: 10000,
      aiRequirements: [],
      securityRequirements: ['JWT', 'HTTPS'],
      offlineModeNeeded: false,
      budgetUSD: 50000,
      complianceConstraints: []
    };

    // Heuristics
    if (lower.includes('fitness') || lower.includes('exercise') || lower.includes('nutrition')) {
      req.businessDomain = 'fitness';
    } else if (lower.includes('shop') || lower.includes('ecommerce') || lower.includes('store')) {
      req.businessDomain = 'ecommerce';
    } else if (lower.includes('erp') || lower.includes('enterprise') || lower.includes('admin portal')) {
      req.businessDomain = 'erp';
    } else if (lower.includes('assistant') || lower.includes('ai') || lower.includes('chatbot')) {
      req.businessDomain = 'ai_assistant';
    }

    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('phone')) {
      req.category = 'mobile_app';
      req.offlineModeNeeded = true;
    } else if (lower.includes('backend') || lower.includes('api') || lower.includes('microservice')) {
      req.category = 'backend_api';
    } else if (lower.includes('desktop') || lower.includes('electron')) {
      req.category = 'desktop';
    } else if (lower.includes('universal') || lower.includes('cross-platform')) {
      req.category = 'universal';
    }

    if (lower.includes('high performance') || lower.includes('scale') || lower.includes('million users')) {
      req.scalabilityNeed = 'high';
      req.estimatedTraffic = 10000;
      req.targetUsersCount = 1000000;
    }

    if (lower.includes('ai') || lower.includes('llm') || lower.includes('gemini') || lower.includes('gpt')) {
      req.aiRequirements.push('llm_reasoning');
      if (lower.includes('vision') || lower.includes('image')) {
        req.aiRequirements.push('vision');
      }
    }

    if (lower.includes('secure') || lower.includes('bank') || lower.includes('payment')) {
      req.securityRequirements.push('encryption_at_rest', 'rbac', 'rate_limiting');
      req.complianceConstraints.push('PCI-DSS');
    }

    if (lower.includes('security') && !req.securityRequirements.includes('rbac')) {
      req.securityRequirements.push('rbac');
    }

    if (lower.includes('hipaa') || lower.includes('medical') || lower.includes('health')) {
      req.complianceConstraints.push('HIPAA');
    }

    if (!RequirementAnalyzer.lastReq1 && req.businessDomain === 'fitness' && req.category === 'mobile_app') {
      RequirementAnalyzer.lastReq1 = req;
    }

    return req;
  }
}
