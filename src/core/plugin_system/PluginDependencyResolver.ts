// ===================================================================
// MONI Sprint 6.7 — PluginDependencyResolver.ts
// Resolves and validates plugin dependencies.
// ===================================================================

import type { PluginManifest } from './PluginRegistry';
import { PluginRegistry } from './PluginRegistry';

export interface DependencyResolution {
  pluginId: string;
  resolved: boolean;
  satisfiedDependencies: ResolvedDependency[];
  missingDependencies: MissingDependency[];
  circularDependencies: string[][];
  installOrder: string[];
  totalDependencies: number;
  resolvedAt: string;
}

export interface ResolvedDependency {
  pluginId: string;
  requiredVersion: string;
  installedVersion: string;
  compatible: boolean;
}

export interface MissingDependency {
  pluginId: string;
  requiredVersion: string;
  optional: boolean;
  reason: string;
}

export interface ConflictReport {
  pluginId: string;
  conflicts: DependencyConflict[];
  hasConflicts: boolean;
  severity: 'none' | 'minor' | 'major' | 'critical';
  resolvedAt: string;
}

export interface DependencyConflict {
  conflictId: string;
  type: 'version-mismatch' | 'circular' | 'incompatible' | 'duplicate';
  pluginA: string;
  pluginB: string;
  description: string;
  resolution: string;
}

export interface VersionValidation {
  pluginId: string;
  valid: boolean;
  currentVersion: string;
  requiredMinVersion: string;
  requiredMaxVersion?: string;
  moniVersion: string;
  compatible: boolean;
  reason: string;
}

export class PluginDependencyResolver {
  private resolutionCache: Map<string, DependencyResolution> = new Map();

  resolveDependencies(manifest: PluginManifest, registry?: PluginRegistry): DependencyResolution {
    const satisfied: ResolvedDependency[] = [];
    const missing: MissingDependency[] = [];
    const installOrder: string[] = [];

    for (const dep of manifest.dependencies) {
      if (registry && registry.hasPlugin(dep.pluginId)) {
        const installed = registry.getPlugin(dep.pluginId)!;
        const compatible = this.isVersionCompatible(installed.version, dep.minVersion, dep.maxVersion);
        satisfied.push({
          pluginId: dep.pluginId,
          requiredVersion: dep.minVersion,
          installedVersion: installed.version,
          compatible,
        });
        if (compatible) {
          installOrder.push(dep.pluginId);
        }
      } else {
        missing.push({
          pluginId: dep.pluginId,
          requiredVersion: dep.minVersion,
          optional: dep.optional,
          reason: 'Plugin not found in registry',
        });
      }
    }

    installOrder.push(manifest.pluginId);

    const circularDeps = this.detectCircularDependencies(manifest, registry);

    const requiredMissing = missing.filter(m => !m.optional);
    const resolved = requiredMissing.length === 0 && circularDeps.length === 0;

    const result: DependencyResolution = {
      pluginId: manifest.pluginId,
      resolved,
      satisfiedDependencies: satisfied,
      missingDependencies: missing,
      circularDependencies: circularDeps,
      installOrder,
      totalDependencies: manifest.dependencies.length,
      resolvedAt: new Date().toISOString(),
    };

    this.resolutionCache.set(manifest.pluginId, result);
    console.log(`[PluginDependencyResolver] Resolved ${manifest.pluginId}: ${resolved ? 'OK' : 'FAILED'} (${satisfied.length}/${manifest.dependencies.length} satisfied)`);
    return result;
  }

  checkConflicts(pluginId: string, registry?: PluginRegistry): ConflictReport {
    const conflicts: DependencyConflict[] = [];

    if (registry) {
      const plugin = registry.getPlugin(pluginId);
      if (plugin) {
        // Check version mismatches
        for (const dep of plugin.dependencies) {
          const depPlugin = registry.getPlugin(dep.pluginId);
          if (depPlugin && !this.isVersionCompatible(depPlugin.version, dep.minVersion, dep.maxVersion)) {
            conflicts.push({
              conflictId: `conflict-${pluginId}-${dep.pluginId}`,
              type: 'version-mismatch',
              pluginA: pluginId,
              pluginB: dep.pluginId,
              description: `Version ${depPlugin.version} does not satisfy ${dep.minVersion}`,
              resolution: `Update ${dep.pluginId} to version ${dep.minVersion} or later`,
            });
          }
        }

        // Check for duplicate registrations
        const allPlugins = registry.listAll();
        const sameNamePlugins = allPlugins.filter(p => p.name === plugin.name && p.pluginId !== pluginId);
        for (const dup of sameNamePlugins) {
          conflicts.push({
            conflictId: `conflict-dup-${pluginId}-${dup.pluginId}`,
            type: 'duplicate',
            pluginA: pluginId,
            pluginB: dup.pluginId,
            description: `Duplicate plugin name: ${plugin.name}`,
            resolution: `Uninstall one of the duplicate plugins`,
          });
        }
      }
    }

    let severity: 'none' | 'minor' | 'major' | 'critical' = 'none';
    if (conflicts.some(c => c.type === 'circular')) severity = 'critical';
    else if (conflicts.some(c => c.type === 'incompatible')) severity = 'major';
    else if (conflicts.length > 0) severity = 'minor';

    return {
      pluginId,
      conflicts,
      hasConflicts: conflicts.length > 0,
      severity,
      resolvedAt: new Date().toISOString(),
    };
  }

  validateVersionCompatibility(pluginId: string, registry?: PluginRegistry): VersionValidation {
    const moniVersion = '6.7.0';
    const plugin = registry?.getPlugin(pluginId);

    if (!plugin) {
      return {
        pluginId,
        valid: false,
        currentVersion: 'unknown',
        requiredMinVersion: 'unknown',
        moniVersion,
        compatible: false,
        reason: 'Plugin not found in registry',
      };
    }

    const compatible = this.isVersionCompatible(moniVersion, plugin.manifest.minMoniVersion, plugin.manifest.maxMoniVersion);

    return {
      pluginId,
      valid: compatible,
      currentVersion: plugin.version,
      requiredMinVersion: plugin.manifest.minMoniVersion,
      requiredMaxVersion: plugin.manifest.maxMoniVersion,
      moniVersion,
      compatible,
      reason: compatible ? 'Version is compatible' : `MONI version ${moniVersion} does not satisfy range`,
    };
  }

  getResolutionCache(): Map<string, DependencyResolution> {
    return new Map(this.resolutionCache);
  }

  private isVersionCompatible(version: string, minVersion: string, maxVersion?: string): boolean {
    const parts = version.split('.').map(Number);
    const minParts = minVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(parts.length, minParts.length); i++) {
      const v = parts[i] || 0;
      const m = minParts[i] || 0;
      if (v > m) return true;
      if (v < m) return false;
    }

    if (maxVersion) {
      const maxParts = maxVersion.split('.').map(Number);
      for (let i = 0; i < Math.max(parts.length, maxParts.length); i++) {
        const v = parts[i] || 0;
        const mx = maxParts[i] || 0;
        if (v < mx) return true;
        if (v > mx) return false;
      }
    }

    return true;
  }

  private detectCircularDependencies(manifest: PluginManifest, registry?: PluginRegistry): string[][] {
    // Simplified circular dependency detection
    const circular: string[][] = [];
    if (!registry) return circular;

    for (const dep of manifest.dependencies) {
      const depPlugin = registry.getPlugin(dep.pluginId);
      if (depPlugin) {
        for (const subDep of depPlugin.dependencies) {
          if (subDep.pluginId === manifest.pluginId) {
            circular.push([manifest.pluginId, dep.pluginId]);
          }
        }
      }
    }

    return circular;
  }
}
