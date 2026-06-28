// ===================================================================
// MONI Sprint 6.7 — PluginRegistry.ts
// Central registry of all installed, enabled, disabled, and pending plugins.
// ===================================================================

export interface PluginManifest {
  pluginId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  tags: string[];
  entryPoint: string;
  permissions: string[];
  dependencies: PluginDependency[];
  minMoniVersion: string;
  maxMoniVersion?: string;
  icon?: string;
  homepage?: string;
  license: string;
  size: number;
  checksum: string;
}

export type PluginCategory =
  | 'ai-provider'
  | 'database'
  | 'cloud-platform'
  | 'ide-integration'
  | 'deployment'
  | 'developer-utility'
  | 'enterprise-extension'
  | 'security'
  | 'monitoring'
  | 'testing'
  | 'documentation'
  | 'communication'
  | 'analytics'
  | 'storage'
  | 'custom';

export interface PluginDependency {
  pluginId: string;
  minVersion: string;
  maxVersion?: string;
  optional: boolean;
}

export type PluginStatus = 'installed' | 'enabled' | 'disabled' | 'pending' | 'error' | 'updating' | 'uninstalling';

export interface PluginEntry {
  pluginId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  tags: string[];
  status: PluginStatus;
  installedAt: string;
  updatedAt: string;
  enabledAt?: string;
  disabledAt?: string;
  permissions: string[];
  dependencies: PluginDependency[];
  loadTimeMs: number;
  errorCount: number;
  usageCount: number;
  rating: number;
  reviewCount: number;
  manifest: PluginManifest;
}

export class PluginRegistry {
  private plugins: Map<string, PluginEntry> = new Map();

  register(plugin: PluginEntry): void {
    this.plugins.set(plugin.pluginId, { ...plugin });
    console.log(`[PluginRegistry] Registered plugin: ${plugin.name} (${plugin.pluginId})`);
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
    console.log(`[PluginRegistry] Unregistered plugin: ${pluginId}`);
  }

  getPlugin(pluginId: string): PluginEntry | undefined {
    return this.plugins.get(pluginId);
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  listAll(): PluginEntry[] {
    return Array.from(this.plugins.values());
  }

  listByCategory(category: string): PluginEntry[] {
    return this.listAll().filter(p => p.category === category);
  }

  listEnabled(): PluginEntry[] {
    return this.listAll().filter(p => p.status === 'enabled');
  }

  listDisabled(): PluginEntry[] {
    return this.listAll().filter(p => p.status === 'disabled');
  }

  listPending(): PluginEntry[] {
    return this.listAll().filter(p => p.status === 'pending');
  }

  listByTag(tag: string): PluginEntry[] {
    return this.listAll().filter(p => p.tags.includes(tag));
  }

  updateStatus(pluginId: string, status: PluginStatus): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.status = status;
      plugin.updatedAt = new Date().toISOString();
      if (status === 'enabled') plugin.enabledAt = new Date().toISOString();
      if (status === 'disabled') plugin.disabledAt = new Date().toISOString();
    }
  }

  incrementUsage(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.usageCount++;
    }
  }

  incrementErrors(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.errorCount++;
    }
  }

  getCount(): number {
    return this.plugins.size;
  }

  getEnabledCount(): number {
    return this.listEnabled().length;
  }

  getDisabledCount(): number {
    return this.listDisabled().length;
  }

  getCategories(): string[] {
    const cats = new Set<string>();
    this.listAll().forEach(p => cats.add(p.category));
    return Array.from(cats);
  }

  search(query: string): PluginEntry[] {
    const q = query.toLowerCase();
    return this.listAll().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.author.toLowerCase().includes(q)
    );
  }

  getDiagnostics(): any {
    return {
      totalPlugins: this.getCount(),
      enabledPlugins: this.getEnabledCount(),
      disabledPlugins: this.getDisabledCount(),
      pendingPlugins: this.listPending().length,
      categories: this.getCategories(),
      totalUsage: this.listAll().reduce((s, p) => s + p.usageCount, 0),
      totalErrors: this.listAll().reduce((s, p) => s + p.errorCount, 0),
    };
  }
}
