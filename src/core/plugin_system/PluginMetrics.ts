// ===================================================================
// MONI Sprint 6.7 — PluginMetrics.ts
// Collects plugin system metrics and health indicators.
// ===================================================================

export interface PluginSystemMetrics {
  totalInstalls: number;
  totalUninstalls: number;
  totalEnables: number;
  totalDisables: number;
  totalUpdates: number;
  totalErrors: number;
  totalSecurityScans: number;
  totalSecurityFailures: number;
  totalDependencyResolutions: number;
  totalDependencyFailures: number;
  totalLoadTime: number;
  averageLoadTimeMs: number;
  pluginUsageMap: Map<string, number>;
  errorMap: Map<string, number>;
  lastUpdated: string;
}

export interface PluginHealthStatus {
  pluginId: string;
  healthy: boolean;
  errorRate: number;
  averageResponseTimeMs: number;
  uptime: number;
  lastError?: string;
  lastErrorAt?: string;
  checkPerformedAt: string;
}

export class PluginMetrics {
  private installs: number = 0;
  private uninstalls: number = 0;
  private enables: number = 0;
  private disables: number = 0;
  private updates: number = 0;
  private errors: number = 0;
  private securityScans: number = 0;
  private securityFailures: number = 0;
  private dependencyResolutions: number = 0;
  private dependencyFailures: number = 0;
  private totalLoadTime: number = 0;
  private loadCount: number = 0;
  private pluginUsage: Map<string, number> = new Map();
  private pluginErrors: Map<string, number> = new Map();
  private pluginLastError: Map<string, { error: string; at: string }> = new Map();

  recordInstall(pluginId: string): void {
    this.installs++;
    console.log(`[PluginMetrics] Recorded install for ${pluginId} (Total: ${this.installs})`);
  }

  recordUninstall(pluginId: string): void {
    this.uninstalls++;
    console.log(`[PluginMetrics] Recorded uninstall for ${pluginId}`);
  }

  recordEnable(pluginId: string): void {
    this.enables++;
    console.log(`[PluginMetrics] Recorded enable for ${pluginId}`);
  }

  recordDisable(pluginId: string): void {
    this.disables++;
    console.log(`[PluginMetrics] Recorded disable for ${pluginId}`);
  }

  recordUpdate(pluginId: string): void {
    this.updates++;
    console.log(`[PluginMetrics] Recorded update for ${pluginId}`);
  }

  recordError(pluginId: string, error: string): void {
    this.errors++;
    this.pluginErrors.set(pluginId, (this.pluginErrors.get(pluginId) || 0) + 1);
    this.pluginLastError.set(pluginId, { error, at: new Date().toISOString() });
  }

  recordUsage(pluginId: string): void {
    this.pluginUsage.set(pluginId, (this.pluginUsage.get(pluginId) || 0) + 1);
  }

  recordSecurityScan(passed: boolean): void {
    this.securityScans++;
    if (!passed) this.securityFailures++;
  }

  recordDependencyResolution(resolved: boolean): void {
    this.dependencyResolutions++;
    if (!resolved) this.dependencyFailures++;
  }

  recordLoadTime(pluginId: string, timeMs: number): void {
    this.totalLoadTime += timeMs;
    this.loadCount++;
    console.log(`[PluginMetrics] Recorded load time ${timeMs}ms for ${pluginId}`);
  }

  getMetrics(): PluginSystemMetrics {
    return {
      totalInstalls: this.installs,
      totalUninstalls: this.uninstalls,
      totalEnables: this.enables,
      totalDisables: this.disables,
      totalUpdates: this.updates,
      totalErrors: this.errors,
      totalSecurityScans: this.securityScans,
      totalSecurityFailures: this.securityFailures,
      totalDependencyResolutions: this.dependencyResolutions,
      totalDependencyFailures: this.dependencyFailures,
      totalLoadTime: this.totalLoadTime,
      averageLoadTimeMs: this.loadCount > 0 ? this.totalLoadTime / this.loadCount : 0,
      pluginUsageMap: new Map(this.pluginUsage),
      errorMap: new Map(this.pluginErrors),
      lastUpdated: new Date().toISOString(),
    };
  }

  getPluginHealth(pluginId: string): PluginHealthStatus {
    const errorCount = this.pluginErrors.get(pluginId) || 0;
    const usageCount = this.pluginUsage.get(pluginId) || 0;
    const errorRate = usageCount > 0 ? errorCount / usageCount : 0;
    const lastError = this.pluginLastError.get(pluginId);

    return {
      pluginId,
      healthy: errorRate < 0.1,
      errorRate,
      averageResponseTimeMs: this.loadCount > 0 ? this.totalLoadTime / this.loadCount : 0,
      uptime: errorRate < 0.05 ? 99.9 : errorRate < 0.1 ? 99.0 : 95.0,
      lastError: lastError?.error,
      lastErrorAt: lastError?.at,
      checkPerformedAt: new Date().toISOString(),
    };
  }

  getTopUsedPlugins(limit: number = 5): { pluginId: string; usage: number }[] {
    return Array.from(this.pluginUsage.entries())
      .map(([pluginId, usage]) => ({ pluginId, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  getMostErrorProne(limit: number = 5): { pluginId: string; errors: number }[] {
    return Array.from(this.pluginErrors.entries())
      .map(([pluginId, errors]) => ({ pluginId, errors }))
      .sort((a, b) => b.errors - a.errors)
      .slice(0, limit);
  }

  reset(): void {
    this.installs = 0;
    this.uninstalls = 0;
    this.enables = 0;
    this.disables = 0;
    this.updates = 0;
    this.errors = 0;
    this.securityScans = 0;
    this.securityFailures = 0;
    this.dependencyResolutions = 0;
    this.dependencyFailures = 0;
    this.totalLoadTime = 0;
    this.loadCount = 0;
    this.pluginUsage.clear();
    this.pluginErrors.clear();
    this.pluginLastError.clear();
  }
}
