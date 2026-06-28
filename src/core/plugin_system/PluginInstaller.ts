// ===================================================================
// MONI Sprint 6.7 — PluginInstaller.ts
// Handles plugin installation from marketplace manifests.
// ===================================================================

import type { PluginManifest, PluginEntry, PluginStatus } from './PluginRegistry';
import { PluginRegistry } from './PluginRegistry';
import { PluginSecurityScanner } from './PluginSecurityScanner';
import { PluginDependencyResolver } from './PluginDependencyResolver';

export interface InstallResult {
  pluginId: string;
  success: boolean;
  status: PluginStatus;
  message: string;
  installedAt: string;
  securityPassed: boolean;
  dependenciesResolved: boolean;
  installDurationMs: number;
}

export interface UninstallResult {
  pluginId: string;
  success: boolean;
  message: string;
  uninstalledAt: string;
  cleanedFiles: string[];
  dependentsAffected: string[];
}

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class PluginInstaller {
  private installHistory: InstallResult[] = [];

  install(
    manifest: PluginManifest,
    registry: PluginRegistry,
    securityScanner: PluginSecurityScanner,
    dependencyResolver: PluginDependencyResolver
  ): InstallResult {
    const startTime = Date.now();

    // 1. Validate manifest
    const validation = this.validateManifest(manifest);
    if (!validation.valid) {
      const result: InstallResult = {
        pluginId: manifest.pluginId,
        success: false,
        status: 'error',
        message: `Manifest validation failed: ${validation.errors.join(', ')}`,
        installedAt: new Date().toISOString(),
        securityPassed: false,
        dependenciesResolved: false,
        installDurationMs: Date.now() - startTime,
      };
      this.installHistory.push(result);
      return result;
    }

    // 2. Check if already installed
    if (registry.hasPlugin(manifest.pluginId)) {
      const result: InstallResult = {
        pluginId: manifest.pluginId,
        success: false,
        status: 'error',
        message: `Plugin ${manifest.pluginId} is already installed`,
        installedAt: new Date().toISOString(),
        securityPassed: false,
        dependenciesResolved: false,
        installDurationMs: Date.now() - startTime,
      };
      this.installHistory.push(result);
      return result;
    }

    // 3. Security scan
    const scanResult = securityScanner.scanPlugin(manifest);
    if (!scanResult.passed) {
      const result: InstallResult = {
        pluginId: manifest.pluginId,
        success: false,
        status: 'error',
        message: `Security scan failed: Risk level ${scanResult.riskLevel} (Score: ${scanResult.score})`,
        installedAt: new Date().toISOString(),
        securityPassed: false,
        dependenciesResolved: false,
        installDurationMs: Date.now() - startTime,
      };
      this.installHistory.push(result);
      return result;
    }

    // 4. Resolve dependencies
    const depResolution = dependencyResolver.resolveDependencies(manifest, registry);
    if (!depResolution.resolved) {
      const missingRequired = depResolution.missingDependencies.filter(m => !m.optional);
      const result: InstallResult = {
        pluginId: manifest.pluginId,
        success: false,
        status: 'error',
        message: `Dependency resolution failed: Missing ${missingRequired.map(m => m.pluginId).join(', ')}`,
        installedAt: new Date().toISOString(),
        securityPassed: true,
        dependenciesResolved: false,
        installDurationMs: Date.now() - startTime,
      };
      this.installHistory.push(result);
      return result;
    }

    // 5. Register plugin
    const entry: PluginEntry = {
      pluginId: manifest.pluginId,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      category: manifest.category,
      tags: manifest.tags,
      status: 'installed',
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: manifest.permissions,
      dependencies: manifest.dependencies,
      loadTimeMs: 0,
      errorCount: 0,
      usageCount: 0,
      rating: 0,
      reviewCount: 0,
      manifest,
    };

    registry.register(entry);

    const result: InstallResult = {
      pluginId: manifest.pluginId,
      success: true,
      status: 'installed',
      message: `Plugin ${manifest.name} v${manifest.version} installed successfully`,
      installedAt: new Date().toISOString(),
      securityPassed: true,
      dependenciesResolved: true,
      installDurationMs: Date.now() - startTime,
    };

    this.installHistory.push(result);
    console.log(`[PluginInstaller] Installed ${manifest.name} (${manifest.pluginId}) v${manifest.version}`);
    return result;
  }

  uninstall(pluginId: string, registry: PluginRegistry): UninstallResult {
    const plugin = registry.getPlugin(pluginId);
    if (!plugin) {
      return {
        pluginId,
        success: false,
        message: `Plugin ${pluginId} not found`,
        uninstalledAt: new Date().toISOString(),
        cleanedFiles: [],
        dependentsAffected: [],
      };
    }

    // Check for dependent plugins
    const dependents = registry.listAll().filter(p =>
      p.dependencies.some(d => d.pluginId === pluginId && !d.optional)
    );

    const dependentIds = dependents.map(d => d.pluginId);

    registry.unregister(pluginId);

    console.log(`[PluginInstaller] Uninstalled ${plugin.name} (${pluginId})`);
    return {
      pluginId,
      success: true,
      message: `Plugin ${plugin.name} uninstalled successfully`,
      uninstalledAt: new Date().toISOString(),
      cleanedFiles: [`plugins/${pluginId}/`, `plugins/${pluginId}/manifest.json`, `plugins/${pluginId}/index.ts`],
      dependentsAffected: dependentIds,
    };
  }

  validateManifest(manifest: PluginManifest): ManifestValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest.pluginId || manifest.pluginId.length === 0) errors.push('Missing pluginId');
    if (!manifest.name || manifest.name.length === 0) errors.push('Missing name');
    if (!manifest.version || manifest.version.length === 0) errors.push('Missing version');
    if (!manifest.author || manifest.author.length === 0) errors.push('Missing author');
    if (!manifest.entryPoint || manifest.entryPoint.length === 0) errors.push('Missing entryPoint');
    if (!manifest.license || manifest.license.length === 0) warnings.push('Missing license');
    if (!manifest.description) warnings.push('Missing description');
    if (manifest.permissions.length === 0) warnings.push('No permissions declared');
    if (manifest.size <= 0) warnings.push('Invalid plugin size');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getInstallHistory(): InstallResult[] {
    return [...this.installHistory];
  }
}
