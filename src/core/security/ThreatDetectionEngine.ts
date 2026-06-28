// ===================================================================
// MONI Sprint 6.8 — ThreatDetectionEngine.ts
// Analyzes commands and code for vulnerabilities (OWASP top 10).
// ===================================================================

export interface ThreatAnalysisRequest {
  sourceType: 'code' | 'command' | 'network' | 'plugin';
  payload: string;
  context?: any;
}

export interface ThreatAnalysisResult {
  requestId: string;
  safe: boolean;
  threatScore: number; // 0-100, 100 is max threat
  identifiedThreats: IdentifiedThreat[];
  analyzedAt: string;
}

export interface IdentifiedThreat {
  threatId: string;
  category: 'Injection' | 'Auth' | 'DataExposure' | 'LateralMovement' | 'Malware' | 'Other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  mitigationSuggestion: string;
}

export class ThreatDetectionEngine {
  private scanHistory: ThreatAnalysisResult[] = [];
  private blockedCount = 0;

  analyze(request: ThreatAnalysisRequest): ThreatAnalysisResult {
    const threats: IdentifiedThreat[] = [];
    let score = 0;
    const lowerPayload = request.payload.toLowerCase();

    // Heuristic 1: SQL Injection
    if (request.sourceType === 'code' && (
      lowerPayload.includes('select * from') && lowerPayload.includes('${') && !lowerPayload.includes('param')
    )) {
      threats.push({
        threatId: `th-sqli-${Date.now()}`,
        category: 'Injection',
        severity: 'critical',
        confidence: 0.95,
        description: 'Possible SQL Injection detected due to unparameterized string interpolation in SQL query.',
        mitigationSuggestion: 'Use parameterized queries or an ORM.',
      });
      score += 40;
    }

    // Heuristic 2: Command Injection
    if (request.sourceType === 'command' && (
      lowerPayload.includes('&& rm -rf') || lowerPayload.includes('; wget') || lowerPayload.includes('| bash')
    )) {
      threats.push({
        threatId: `th-cmdi-${Date.now()}`,
        category: 'Injection',
        severity: 'critical',
        confidence: 0.99,
        description: 'High-risk shell operators detected indicating potential command injection.',
        mitigationSuggestion: 'Sanitize command inputs and avoid executing raw shell strings.',
      });
      score += 60;
    }

    // Heuristic 3: Sensitive Data Exposure (Secrets)
    if (lowerPayload.match(/(api[_-]?key|secret|password|token)\s*=\s*['"][a-z0-9A-Z]{10,}['"]/)) {
      threats.push({
        threatId: `th-sec-${Date.now()}`,
        category: 'DataExposure',
        severity: 'high',
        confidence: 0.9,
        description: 'Hardcoded secret or API key detected in payload.',
        mitigationSuggestion: 'Use SecretsManagementSimulator to fetch credentials at runtime.',
      });
      score += 35;
    }

    // Heuristic 4: XSS
    if (request.sourceType === 'code' && lowerPayload.includes('innerhtml') && lowerPayload.includes('request.')) {
      threats.push({
        threatId: `th-xss-${Date.now()}`,
        category: 'Injection',
        severity: 'high',
        confidence: 0.85,
        description: 'Potential Cross-Site Scripting (XSS) via unsanitized user input assigned to innerHTML.',
        mitigationSuggestion: 'Sanitize input before assignment or use textContent.',
      });
      score += 30;
    }

    const isSafe = score < 50;
    if (!isSafe) this.blockedCount++;

    const result: ThreatAnalysisResult = {
      requestId: `req-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      safe: isSafe,
      threatScore: Math.min(100, score),
      identifiedThreats: threats,
      analyzedAt: new Date().toISOString(),
    };

    this.scanHistory.push(result);
    return result;
  }

  getHistory(): ThreatAnalysisResult[] {
    return [...this.scanHistory];
  }

  getMetrics(): any {
    const total = this.scanHistory.length;
    const avgScore = total > 0 ? this.scanHistory.reduce((acc, r) => acc + r.threatScore, 0) / total : 0;
    
    // Attack heatmap simulation
    const categoryCounts: Record<string, number> = {};
    this.scanHistory.forEach(h => {
      h.identifiedThreats.forEach(t => {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      });
    });

    return {
      totalScans: total,
      blockedThreats: this.blockedCount,
      averageThreatScore: avgScore,
      categoryHeatmap: categoryCounts,
      activeThreatLevel: avgScore > 30 ? 'ELEVATED' : 'NORMAL'
    };
  }
}
