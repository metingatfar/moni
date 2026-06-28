// ===================================================================
// MONI Sprint 6.7 — PluginUpdater.ts
// Plugin update engine for managing version transitions.
// ===================================================================

import { PluginRegistry } from './PluginRegistry';
import type { PluginEntry } from './PluginRegistry';

export interface UpdateCheckResult {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateType: 'major' | 'minor' | 'patch' | 'none';
  releaseNotes: string;
  publishedAt: string;
  size: number;
  breaking: boolean;
}

export interface UpdateResult {
  pluginId: string;
  success: boolean;
  previousVersion: string;
  newVersion: string;
  message: string;
  updatedAt: string;
  updateDurationMs: number;
  rollbackAvailable: boolean;
}

export interface RollbackResult {
  pluginId: string;
  success: boolean;
  rolledBackFrom: string;
  rolledBackTo: string;
  message: string;
  rolledBackAt: string;
}

interface VersionSnapshot {
  pluginId: string;
  version: string;
  snapshotAt: string;
  entry: PluginEntry;
}

export class PluginUpdater {
  private updateHistory: UpdateResult[] = [];
  private versionSnapshots: Map<string, VersionSnapshot[]> = new Map();

  checkForUpdates(registry: PluginRegistry): UpdateCheckResult[] {
    const results: UpdateCheckResult[] = [];

    for (const plugin of registry.listAll()) {
      const currentParts = plugin.version.split('.').map(Number);
      // Simulate available update by bumping patch version
      const latestParts = [...currentParts];
      latestParts[2] = (latestParts[2] || 0) + 1;
      const latestVersion = latestParts.join('.');

      const updateType = this.getUpdateType(plugin.version, latestVersion);

      results.push({
        pluginId: plugin.pluginId,
        currentVersion: plugin.version,
        latestVersion,
        updateAvailable: true,
        updateType,
        releaseNotes: `Bug fixes, performance improvements, and security patches for ${plugin.name}`,
        publishedAt: new Date().toISOString(),
        size: plugin.manifest.size + 10240,
        breaking: updateType === 'major',
      });
    }

    console.log(`[PluginUpdater] Checked ${results.length} plugins for updates`);
    return results;
  }

  async updatePlugin(pluginId: string, registry: PluginRegistry): Promise<UpdateResult> {
    const startTime = Date.now();
    const plugin = registry.getPlugin(pluginId);

    if (!plugin) {
      return {
        pluginId,
        success: false,
        previousVersion: 'unknown',
        newVersion: 'unknown',
        message: `Plugin ${pluginId} not found`,
        updatedAt: new Date().toISOString(),
        updateDurationMs: Date.now() - startTime,
        rollbackAvailable: false,
      };
    }

    // Save snapshot for rollback
    if (!this.versionSnapshots.has(pluginId)) {
      this.versionSnapshots.set(pluginId, []);
    }
    this.versionSnapshots.get(pluginId)!.push({
      pluginId,
      version: plugin.version,
      snapshotAt: new Date().toISOString(),
      entry: { ...plugin },
    });

    const previousVersion = plugin.version;
    const versionParts = previousVersion.split('.').map(Number);
    versionParts[2] = (versionParts[2] || 0) + 1;
    const newVersion = versionParts.join('.');

    // Update in registry
    registry.updateStatus(pluginId, 'updating');

    // Simulate update process
    const updatedPlugin = registry.getPlugin(pluginId);
    if (updatedPlugin) {
      updatedPlugin.version = newVersion;
      updatedPlugin.manifest.version = newVersion;
      updatedPlugin.updatedAt = new Date().toISOString();
      updatedPlugin.status = plugin.status === 'enabled' ? 'enabled' : 'installed';
    }

    const result: UpdateResult = {
      pluginId,
      success: true,
      previousVersion,
      newVersion,
      message: `Plugin ${plugin.name} updated from v${previousVersion} to v${newVersion}`,
      updatedAt: new Date().toISOString(),
      updateDurationMs: Date.now() - startTime,
      rollbackAvailable: true,
    };

    this.updateHistory.push(result);
    console.log(`[PluginUpdater] Updated ${plugin.name}: v${previousVersion} → v${newVersion}`);
    return result;
  }

  async rollbackUpdate(pluginId: string, registry: PluginRegistry): Promise<RollbackResult> {
    const snapshots = this.versionSnapshots.get(pluginId);
    if (!snapshots || snapshots.length === 0) {
      return {
        pluginId,
        success: false,
        rolledBackFrom: 'unknown',
        rolledBackTo: 'unknown',
        message: 'No rollback snapshot available',
        rolledBackAt: new Date().toISOString(),
      };
    }

    const lastSnapshot = snapshots.pop()!;
    const currentPlugin = registry.getPlugin(pluginId);
    const currentVersion = currentPlugin?.version || 'unknown';

    // Restore previous version
    if (currentPlugin) {
      currentPlugin.version = lastSnapshot.version;
      currentPlugin.manifest.version = lastSnapshot.version;
      currentPlugin.status = lastSnapshot.entry.status;
      currentPlugin.updatedAt = new Date().toISOString();
    }

    console.log(`[PluginUpdater] Rolled back ${pluginId}: v${currentVersion} → v${lastSnapshot.version}`);
    return {
      pluginId,
      success: true,
      rolledBackFrom: currentVersion,
      rolledBackTo: lastSnapshot.version,
      message: `Plugin rolled back to v${lastSnapshot.version}`,
      rolledBackAt: new Date().toISOString(),
    };
  }

  getUpdateHistory(): UpdateResult[] {
    return [...this.updateHistory];
  }

  hasRollback(pluginId: string): boolean {
    const snapshots = this.versionSnapshots.get(pluginId);
    return !!snapshots && snapshots.length > 0;
  }

  private getUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
    const c = current.split('.').map(Number);
    const l = latest.split('.').map(Number);

    if (l[0] > c[0]) return 'major';
    if (l[1] > c[1]) return 'minor';
    if (l[2] > c[2]) return 'patch';
    return 'none';
  }
}
