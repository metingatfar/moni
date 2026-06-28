// ===================================================================
// MONI Sprint 6.8 — SecretsManagementSimulator.ts
// Virtual secure vault for managing API keys, certificates, and variables.
// ===================================================================

export interface Secret {
  key: string;
  value: string;
  type: 'api_key' | 'certificate' | 'password' | 'token';
  environment: 'dev' | 'staging' | 'prod';
  createdAt: string;
  expiresAt?: string;
}

export interface AccessLog {
  timestamp: string;
  key: string;
  accessor: string;
  status: 'granted' | 'denied_expired' | 'denied_unauthorized';
}

export class SecretsManagementSimulator {
  private vault: Map<string, Secret> = new Map();
  private accessLogs: AccessLog[] = [];

  constructor() {
    // Seed virtual vault
    this.vault.set('OPENAI_API_KEY', {
      key: 'OPENAI_API_KEY',
      value: 'sk-virtual-mock-key-12345',
      type: 'api_key',
      environment: 'prod',
      createdAt: new Date().toISOString()
    });
  }

  storeSecret(secret: Secret): void {
    this.vault.set(secret.key, secret);
  }

  getSecret(key: string, accessor: string): string | null {
    const secret = this.vault.get(key);
    
    if (!secret) {
      this.logAccess(key, accessor, 'denied_unauthorized');
      return null;
    }

    if (secret.expiresAt && new Date(secret.expiresAt) < new Date()) {
      this.logAccess(key, accessor, 'denied_expired');
      return null;
    }

    this.logAccess(key, accessor, 'granted');
    return secret.value;
  }

  revokeSecret(key: string): boolean {
    return this.vault.delete(key);
  }

  listKeys(): string[] {
    return Array.from(this.vault.keys());
  }

  getLogs(): AccessLog[] {
    return [...this.accessLogs];
  }

  private logAccess(key: string, accessor: string, status: AccessLog['status']) {
    this.accessLogs.push({
      timestamp: new Date().toISOString(),
      key,
      accessor,
      status
    });
  }

  getMetrics(): any {
    const totalRequests = this.accessLogs.length;
    const denied = this.accessLogs.filter(l => l.status !== 'granted').length;

    return {
      vaultSize: this.vault.size,
      totalAccessRequests: totalRequests,
      deniedRequests: denied,
      activeLeases: this.vault.size // simplified
    };
  }
}
