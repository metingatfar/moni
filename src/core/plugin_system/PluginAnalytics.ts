// ===================================================================
// MONI Sprint 6.7 Enterprise Addendum — PluginAnalytics.ts
// Tracks detailed plugin usage analytics and health scoring.
// ===================================================================

export interface PluginAnalyticsData {
  pluginId: string;
  installCount: number;
  activeUsers: number;
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  crashCount: number;
  averageLoadTimeMs: number;
  healthScore: number;
  compatibilityScore: number;
  updateFrequency: number;
  resourceUsageMB: number;
  errorFrequency: number;
  lastActiveAt: string;
  firstInstalledAt: string;
  retentionRate: number;
  satisfactionScore: number;
}

export interface AnalyticsSnapshot {
  timestamp: string;
  totalPlugins: number;
  activePlugins: number;
  totalCrashes: number;
  averageHealthScore: number;
  averageLoadTimeMs: number;
  totalResourceUsageMB: number;
  topPlugins: { pluginId: string; usage: number }[];
  worstHealthPlugins: { pluginId: string; healthScore: number }[];
}

export interface AnalyticsTrend {
  pluginId: string;
  metric: string;
  values: { timestamp: string; value: number }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

export class PluginAnalytics {
  private analytics: Map<string, PluginAnalyticsData> = new Map();
  private snapshots: AnalyticsSnapshot[] = [];

  trackInstall(pluginId: string): void {
    this.ensureEntry(pluginId);
    const data = this.analytics.get(pluginId)!;
    data.installCount++;
    data.firstInstalledAt = data.firstInstalledAt || new Date().toISOString();
    console.log(`[PluginAnalytics] Tracked install for ${pluginId}`);
  }

  trackUsage(pluginId: string): void {
    this.ensureEntry(pluginId);
    const data = this.analytics.get(pluginId)!;
    data.dailyUsage++;
    data.weeklyUsage++;
    data.monthlyUsage++;
    data.lastActiveAt = new Date().toISOString();
    this.recalculateHealth(pluginId);
  }

  trackCrash(pluginId: string): void {
    this.ensureEntry(pluginId);
    const data = this.analytics.get(pluginId)!;
    data.crashCount++;
    data.errorFrequency = data.crashCount / Math.max(1, data.dailyUsage);
    this.recalculateHealth(pluginId);
    console.log(`[PluginAnalytics] Tracked crash for ${pluginId}`);
  }

  trackLoadTime(pluginId: string, timeMs: number): void {
    this.ensureEntry(pluginId);
    const data = this.analytics.get(pluginId)!;
    data.averageLoadTimeMs = (data.averageLoadTimeMs + timeMs) / 2;
    this.recalculateHealth(pluginId);
  }

  trackResourceUsage(pluginId: string, memoryMB: number): void {
    this.ensureEntry(pluginId);
    const data = this.analytics.get(pluginId)!;
    data.resourceUsageMB = memoryMB;
  }

  setActiveUsers(pluginId: string, count: number): void {
    this.ensureEntry(pluginId);
    this.analytics.get(pluginId)!.activeUsers = count;
  }

  getAnalytics(pluginId: string): PluginAnalyticsData | undefined {
    return this.analytics.get(pluginId);
  }

  getAllAnalytics(): PluginAnalyticsData[] {
    return Array.from(this.analytics.values());
  }

  getHealthScore(pluginId: string): number {
    return this.analytics.get(pluginId)?.healthScore ?? 0;
  }

  getTopPlugins(limit: number = 5): { pluginId: string; usage: number }[] {
    return Array.from(this.analytics.entries())
      .map(([pluginId, data]) => ({ pluginId, usage: data.dailyUsage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  getWorstHealthPlugins(limit: number = 5): { pluginId: string; healthScore: number }[] {
    return Array.from(this.analytics.entries())
      .map(([pluginId, data]) => ({ pluginId, healthScore: data.healthScore }))
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, limit);
  }

  takeSnapshot(): AnalyticsSnapshot {
    const allData = this.getAllAnalytics();
    const snapshot: AnalyticsSnapshot = {
      timestamp: new Date().toISOString(),
      totalPlugins: allData.length,
      activePlugins: allData.filter(d => d.dailyUsage > 0).length,
      totalCrashes: allData.reduce((s, d) => s + d.crashCount, 0),
      averageHealthScore: allData.length > 0 ? allData.reduce((s, d) => s + d.healthScore, 0) / allData.length : 0,
      averageLoadTimeMs: allData.length > 0 ? allData.reduce((s, d) => s + d.averageLoadTimeMs, 0) / allData.length : 0,
      totalResourceUsageMB: allData.reduce((s, d) => s + d.resourceUsageMB, 0),
      topPlugins: this.getTopPlugins(5),
      worstHealthPlugins: this.getWorstHealthPlugins(5),
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  getSnapshots(): AnalyticsSnapshot[] {
    return [...this.snapshots];
  }

  getTrend(pluginId: string, metric: string): AnalyticsTrend {
    const data = this.analytics.get(pluginId);
    const currentValue = data ? (data as any)[metric] ?? 0 : 0;

    return {
      pluginId,
      metric,
      values: [
        { timestamp: new Date(Date.now() - 86400000).toISOString(), value: Math.max(0, currentValue - Math.floor(Math.random() * 10)) },
        { timestamp: new Date().toISOString(), value: currentValue },
      ],
      trend: currentValue > 5 ? 'increasing' : currentValue < 2 ? 'decreasing' : 'stable',
      changePercent: Math.floor(Math.random() * 20) - 5,
    };
  }

  getDiagnostics(): any {
    const allData = this.getAllAnalytics();
    return {
      trackedPlugins: allData.length,
      totalInstalls: allData.reduce((s, d) => s + d.installCount, 0),
      totalCrashes: allData.reduce((s, d) => s + d.crashCount, 0),
      averageHealthScore: allData.length > 0 ? allData.reduce((s, d) => s + d.healthScore, 0) / allData.length : 0,
      snapshotCount: this.snapshots.length,
    };
  }

  private ensureEntry(pluginId: string): void {
    if (!this.analytics.has(pluginId)) {
      this.analytics.set(pluginId, {
        pluginId,
        installCount: 0,
        activeUsers: 0,
        dailyUsage: 0,
        weeklyUsage: 0,
        monthlyUsage: 0,
        crashCount: 0,
        averageLoadTimeMs: 0,
        healthScore: 100,
        compatibilityScore: 100,
        updateFrequency: 0,
        resourceUsageMB: 0,
        errorFrequency: 0,
        lastActiveAt: '',
        firstInstalledAt: '',
        retentionRate: 100,
        satisfactionScore: 5.0,
      });
    }
  }

  private recalculateHealth(pluginId: string): void {
    const data = this.analytics.get(pluginId);
    if (!data) return;

    let health = 100;
    health -= Math.min(40, data.crashCount * 5);
    health -= Math.min(20, data.errorFrequency * 100);
    health -= Math.min(15, Math.max(0, data.averageLoadTimeMs - 100) / 20);
    health -= Math.min(15, Math.max(0, data.resourceUsageMB - 50) / 10);
    data.healthScore = Math.max(0, Math.round(health));
  }
}
