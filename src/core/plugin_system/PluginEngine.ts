// ===================================================================
// MONI Sprint 6.7 — PluginEngine.ts
// Master coordinator for the plugin lifecycle.
// ===================================================================

import { PluginRegistry } from './PluginRegistry';
import type { PluginManifest, PluginEntry, PluginStatus } from './PluginRegistry';
import { PluginInstaller } from './PluginInstaller';
import type { InstallResult, UninstallResult } from './PluginInstaller';
import { PluginLoader } from './PluginLoader';
import type { LoadResult } from './PluginLoader';
import { PluginSecurityScanner } from './PluginSecurityScanner';
import type { SecurityScanResult } from './PluginSecurityScanner';
import { PluginDependencyResolver } from './PluginDependencyResolver';
import type { DependencyResolution } from './PluginDependencyResolver';
import { PluginPermissionManager } from './PluginPermissionManager';
import { PluginMarketplace } from './PluginMarketplace';
import { PluginUpdater } from './PluginUpdater';
import type { UpdateCheckResult, UpdateResult } from './PluginUpdater';
import { PluginMetrics } from './PluginMetrics';
import { PluginReport } from './PluginReport';

export interface PluginInstallResult {
  installResult: InstallResult;
  securityScan: SecurityScanResult;
  dependencyResolution: DependencyResolution;
  loadResult?: LoadResult;
}

export interface PluginUninstallResult {
  uninstallResult: UninstallResult;
}

export interface PluginStatusResult {
  pluginId: string;
  success: boolean;
  previousStatus: PluginStatus;
  newStatus: PluginStatus;
  message: string;
}

export interface PluginUpdateResult {
  updateResult: UpdateResult;
}

export interface PluginEngineDiagnostics {
  registry: any;
  marketplace: any;
  loader: any;
  permissions: any;
  metrics: any;
}

export class PluginEngine {
  private registry: PluginRegistry;
  private installer: PluginInstaller;
  private loader: PluginLoader;
  private securityScanner: PluginSecurityScanner;
  private dependencyResolver: PluginDependencyResolver;
  private permissionManager: PluginPermissionManager;
  private marketplace: PluginMarketplace;
  private updater: PluginUpdater;
  private metrics: PluginMetrics;
  private report: PluginReport;

  constructor() {
    this.registry = new PluginRegistry();
    this.installer = new PluginInstaller();
    this.loader = new PluginLoader();
    this.securityScanner = new PluginSecurityScanner();
    this.dependencyResolver = new PluginDependencyResolver();
    this.permissionManager = new PluginPermissionManager();
    this.marketplace = new PluginMarketplace();
    this.updater = new PluginUpdater();
    this.metrics = new PluginMetrics();
    this.report = new PluginReport();
  }

  async installPlugin(manifest: PluginManifest): Promise<PluginInstallResult> {
    console.log(`[PluginEngine] Installing plugin: ${manifest.name} (${manifest.pluginId})`);

    // 1. Security scan
    const securityScan = this.securityScanner.scanPlugin(manifest);
    this.metrics.recordSecurityScan(securityScan.passed);

    // 2. Dependency resolution
    const depResolution = this.dependencyResolver.resolveDependencies(manifest, this.registry);
    this.metrics.recordDependencyResolution(depResolution.resolved);

    // 3. Install
    const installResult = this.installer.install(manifest, this.registry, this.securityScanner, this.dependencyResolver);

    if (installResult.success) {
      this.metrics.recordInstall(manifest.pluginId);

      // 4. Grant permissions
      for (const perm of manifest.permissions) {
        this.permissionManager.grantPermission(manifest.pluginId, perm, 'PluginEngine');
      }

      // 5. Load plugin
      const loadResult = await this.loader.loadPlugin(manifest.pluginId);
      this.metrics.recordLoadTime(manifest.pluginId, loadResult.loadTimeMs);

      return { installResult, securityScan, dependencyResolution: depResolution, loadResult };
    }

    return { installResult, securityScan, dependencyResolution: depResolution };
  }

  async uninstallPlugin(pluginId: string): Promise<PluginUninstallResult> {
    console.log(`[PluginEngine] Uninstalling plugin: ${pluginId}`);

    // 1. Unload
    await this.loader.unloadPlugin(pluginId);

    // 2. Revoke all permissions
    this.permissionManager.revokeAllPermissions(pluginId);

    // 3. Uninstall
    const uninstallResult = this.installer.uninstall(pluginId, this.registry);
    if (uninstallResult.success) {
      this.metrics.recordUninstall(pluginId);
    }

    return { uninstallResult };
  }

  async enablePlugin(pluginId: string): Promise<PluginStatusResult> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      return {
        pluginId,
        success: false,
        previousStatus: 'error',
        newStatus: 'error',
        message: `Plugin ${pluginId} not found`,
      };
    }

    const previousStatus = plugin.status;

    if (plugin.status === 'enabled') {
      return {
        pluginId,
        success: true,
        previousStatus,
        newStatus: 'enabled',
        message: `Plugin ${plugin.name} is already enabled`,
      };
    }

    // Load the plugin if not loaded
    if (!this.loader.isLoaded(pluginId)) {
      await this.loader.loadPlugin(pluginId);
    }

    this.registry.updateStatus(pluginId, 'enabled');
    this.metrics.recordEnable(pluginId);

    console.log(`[PluginEngine] Enabled plugin: ${plugin.name}`);
    return {
      pluginId,
      success: true,
      previousStatus,
      newStatus: 'enabled',
      message: `Plugin ${plugin.name} enabled successfully`,
    };
  }

  async disablePlugin(pluginId: string): Promise<PluginStatusResult> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      return {
        pluginId,
        success: false,
        previousStatus: 'error',
        newStatus: 'error',
        message: `Plugin ${pluginId} not found`,
      };
    }

    const previousStatus = plugin.status;

    if (plugin.status === 'disabled') {
      return {
        pluginId,
        success: true,
        previousStatus,
        newStatus: 'disabled',
        message: `Plugin ${plugin.name} is already disabled`,
      };
    }

    // Unload the plugin
    await this.loader.unloadPlugin(pluginId);

    this.registry.updateStatus(pluginId, 'disabled');
    this.metrics.recordDisable(pluginId);

    console.log(`[PluginEngine] Disabled plugin: ${plugin.name}`);
    return {
      pluginId,
      success: true,
      previousStatus,
      newStatus: 'disabled',
      message: `Plugin ${plugin.name} disabled successfully`,
    };
  }

  async updatePlugin(pluginId: string): Promise<PluginUpdateResult> {
    console.log(`[PluginEngine] Updating plugin: ${pluginId}`);
    const updateResult = await this.updater.updatePlugin(pluginId, this.registry);
    if (updateResult.success) {
      this.metrics.recordUpdate(pluginId);
    }
    return { updateResult };
  }

  getPluginStatus(pluginId: string): PluginStatus {
    const plugin = this.registry.getPlugin(pluginId);
    return plugin?.status || 'error';
  }

  // === Proxy methods for subsystems ===

  searchMarketplace(query: string) {
    return this.marketplace.searchPlugins(query);
  }

  getFeaturedPlugins() {
    return this.marketplace.getFeaturedPlugins();
  }

  getMarketplaceCategories() {
    return this.marketplace.getCategories();
  }

  getPluginsByCategory(category: string) {
    return this.marketplace.getPluginsByCategory(category);
  }

  getPluginDetails(pluginId: string) {
    return this.marketplace.getPluginDetails(pluginId);
  }

  submitRating(pluginId: string, rating: number, review: string) {
    this.marketplace.submitRating(pluginId, rating, review);
  }

  checkForUpdates(): UpdateCheckResult[] {
    return this.updater.checkForUpdates(this.registry);
  }

  checkPermission(pluginId: string, permission: string): boolean {
    return this.permissionManager.checkPermission(pluginId, permission);
  }

  getPluginPermissions(pluginId: string): string[] {
    return this.permissionManager.getPluginPermissions(pluginId);
  }

  getInstalledPlugins(): PluginEntry[] {
    return this.registry.listAll();
  }

  getEnabledPlugins(): PluginEntry[] {
    return this.registry.listEnabled();
  }

  getDisabledPlugins(): PluginEntry[] {
    return this.registry.listDisabled();
  }

  getSecurityScanHistory() {
    return this.securityScanner.getScanHistory();
  }

  getPluginHealth(pluginId: string) {
    return this.metrics.getPluginHealth(pluginId);
  }

  getSystemMetrics() {
    return this.metrics.getMetrics();
  }

  recordPluginUsage(pluginId: string) {
    this.metrics.recordUsage(pluginId);
    this.registry.incrementUsage(pluginId);
  }

  recordPluginError(pluginId: string, error: string) {
    this.metrics.recordError(pluginId, error);
    this.registry.incrementErrors(pluginId);
  }

  generateReports(targetDir?: string): void {
    this.report.generatePluginReports(
      this.registry,
      this.metrics,
      this.marketplace,
      this.securityScanner,
      this.dependencyResolver,
      this.permissionManager,
      this.updater,
      this.loader,
      targetDir
    );
  }

  getDiagnostics(): PluginEngineDiagnostics {
    return {
      registry: this.registry.getDiagnostics(),
      marketplace: this.marketplace.getDiagnostics(),
      loader: this.loader.getDiagnostics(),
      permissions: this.permissionManager.getDiagnostics(),
      metrics: this.metrics.getMetrics(),
    };
  }

  // Expose sub-engines for direct access
  getRegistry(): PluginRegistry { return this.registry; }
  getInstaller(): PluginInstaller { return this.installer; }
  getLoader(): PluginLoader { return this.loader; }
  getSecurityScanner(): PluginSecurityScanner { return this.securityScanner; }
  getDependencyResolver(): PluginDependencyResolver { return this.dependencyResolver; }
  getPermissionManager(): PluginPermissionManager { return this.permissionManager; }
  getMarketplace(): PluginMarketplace { return this.marketplace; }
  getUpdater(): PluginUpdater { return this.updater; }
  getMetrics(): PluginMetrics { return this.metrics; }
  getReportEngine(): PluginReport { return this.report; }
}
