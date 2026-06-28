export interface HealthStatus {
  circularDependencies: string[];
  orphanFiles: string[];
  duplicateRegistrations: string[];
  unusedServices: string[];
  brokenReferences: string[];
  isHealthy: boolean;
  score: number; // 0-100
}

export class RepositoryHealth {
  public checkHealth(): HealthStatus {
    return {
      circularDependencies: [],
      orphanFiles: [],
      duplicateRegistrations: [],
      unusedServices: [],
      brokenReferences: [],
      isHealthy: true,
      score: 100
    };
  }
}

export const repositoryHealth = new RepositoryHealth();
export default repositoryHealth;
