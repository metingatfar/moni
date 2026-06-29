export type ProviderState = 'healthy' | 'rate_limited' | 'cooldown' | 'offline' | 'unknown';

export interface ProviderHealth {
  name: string;
  state: ProviderState;
  lastSuccess: string | null;
  lastFailure: string | null;
  failureCount: number;
  cooldownUntil: number; // timestamp in ms
}

export class ProviderHealthMonitor {
  private static instance: ProviderHealthMonitor;
  private providers: Record<string, ProviderHealth> = {};
  private listeners: (() => void)[] = [];

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): ProviderHealthMonitor {
    if (!ProviderHealthMonitor.instance) {
      ProviderHealthMonitor.instance = new ProviderHealthMonitor();
    }
    return ProviderHealthMonitor.instance;
  }

  private initializeProviders() {
    const names = ['gemini', 'openai', 'groq', 'local'];
    for (const name of names) {
      this.providers[name] = {
        name,
        state: name === 'local' ? 'healthy' : 'unknown',
        lastSuccess: null,
        lastFailure: null,
        failureCount: 0,
        cooldownUntil: 0
      };
    }
  }

  public getStatusList(): ProviderHealth[] {
    // Return a copies list
    return Object.values(this.providers).map(p => {
      // Auto-resolve state based on cooldown timestamp
      if (p.name !== 'local') {
        if (p.cooldownUntil > Date.now()) {
          p.state = 'cooldown';
        } else if (p.state === 'cooldown') {
          p.state = 'healthy';
        }
      }
      return { ...p };
    });
  }

  public getProviderStatus(name: string): ProviderHealth {
    const p = this.providers[name] || {
      name,
      state: 'unknown',
      lastSuccess: null,
      lastFailure: null,
      failureCount: 0,
      cooldownUntil: 0
    };
    if (p.name !== 'local' && p.cooldownUntil > Date.now()) {
      p.state = 'cooldown';
    }
    return p;
  }

  public logSuccess(name: string): void {
    const p = this.providers[name];
    if (p) {
      p.state = 'healthy';
      p.lastSuccess = new Date().toISOString();
      p.failureCount = 0;
      p.cooldownUntil = 0;
      this.notifyListeners();
    }
  }

  public logFailure(name: string, isRateLimit = false): void {
    const p = this.providers[name];
    if (p) {
      p.lastFailure = new Date().toISOString();
      p.failureCount += 1;

      if (isRateLimit) {
        p.state = 'rate_limited';
        p.cooldownUntil = Date.now() + 60 * 1000; // 60s cooldown
      } else if (p.failureCount >= 3) {
        p.state = 'offline';
        p.cooldownUntil = Date.now() + 120 * 1000; // 120s cooldown
      } else {
        p.state = 'unknown';
      }
      this.notifyListeners();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (_) {}
    }
  }
}

export const providerHealthMonitor = ProviderHealthMonitor.getInstance();
export default providerHealthMonitor;
