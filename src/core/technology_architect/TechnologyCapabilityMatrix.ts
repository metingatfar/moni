export interface CapabilityScores {
  performance: number; // 1-100
  scalability: number;
  security: number;
  maintainability: number;
  enterpriseReady: number;
  community: number;
  aiCompatibility: number;
  offlineCapability: number;
}

export class TechnologyCapabilityMatrix {
  private matrix: Record<string, CapabilityScores> = {
    typescript: { performance: 80, scalability: 85, security: 80, maintainability: 90, enterpriseReady: 95, community: 95, aiCompatibility: 90, offlineCapability: 85 },
    python: { performance: 65, scalability: 75, security: 75, maintainability: 85, enterpriseReady: 85, community: 98, aiCompatibility: 98, offlineCapability: 50 },
    dart: { performance: 82, scalability: 80, security: 80, maintainability: 80, enterpriseReady: 80, community: 78, aiCompatibility: 82, offlineCapability: 90 },
    go: { performance: 95, scalability: 95, security: 90, maintainability: 88, enterpriseReady: 90, community: 85, aiCompatibility: 80, offlineCapability: 30 },
    rust: { performance: 100, scalability: 98, security: 100, maintainability: 85, enterpriseReady: 85, community: 80, aiCompatibility: 75, offlineCapability: 40 },
    csharp: { performance: 88, scalability: 90, security: 90, maintainability: 85, enterpriseReady: 98, community: 90, aiCompatibility: 82, offlineCapability: 60 },
    
    react: { performance: 82, scalability: 90, security: 80, maintainability: 85, enterpriseReady: 90, community: 98, aiCompatibility: 90, offlineCapability: 70 },
    nextjs: { performance: 88, scalability: 92, security: 85, maintainability: 88, enterpriseReady: 92, community: 92, aiCompatibility: 88, offlineCapability: 60 },
    flutter: { performance: 88, scalability: 85, security: 85, maintainability: 82, enterpriseReady: 85, community: 88, aiCompatibility: 85, offlineCapability: 95 },
    
    fastapi: { performance: 90, scalability: 88, security: 80, maintainability: 85, enterpriseReady: 80, community: 85, aiCompatibility: 95, offlineCapability: 20 },
    nestjs: { performance: 85, scalability: 90, security: 88, maintainability: 90, enterpriseReady: 92, community: 85, aiCompatibility: 88, offlineCapability: 30 },
    aspnet_core: { performance: 92, scalability: 95, security: 92, maintainability: 88, enterpriseReady: 98, community: 88, aiCompatibility: 80, offlineCapability: 45 },
    
    sqlite: { performance: 90, scalability: 30, security: 75, maintainability: 85, enterpriseReady: 60, community: 90, aiCompatibility: 70, offlineCapability: 100 },
    postgresql: { performance: 90, scalability: 95, security: 95, maintainability: 90, enterpriseReady: 98, community: 98, aiCompatibility: 85, offlineCapability: 10 },
    mongodb: { performance: 85, scalability: 90, security: 80, maintainability: 85, enterpriseReady: 85, community: 92, aiCompatibility: 85, offlineCapability: 20 },
    supabase: { performance: 88, scalability: 88, security: 88, maintainability: 90, enterpriseReady: 85, community: 82, aiCompatibility: 88, offlineCapability: 70 }
  };

  public getScores(techId: string): CapabilityScores {
    return this.matrix[techId.toLowerCase()] || {
      performance: 70,
      scalability: 70,
      security: 70,
      maintainability: 70,
      enterpriseReady: 70,
      community: 70,
      aiCompatibility: 70,
      offlineCapability: 50
    };
  }
}
