export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  status: 'enabled' | 'disabled';
  dependencies: string[];
  compatibility: string; // e.g., '>=5.0.0'
  health: 'healthy' | 'critical';
}

export class PluginManager {
  private plugins: Map<string, PluginInfo> = new Map();

  constructor() {
    this.initializeDefaultPlugins();
  }

  private initializeDefaultPlugins(): void {
    this.plugins.set('spotify', {
      id: 'spotify',
      name: 'Spotify Player Plugin',
      version: '1.2.0',
      status: 'enabled',
      dependencies: ['ExperienceEngine'],
      compatibility: '>=5.0.0',
      health: 'healthy'
    });
    this.plugins.set('git-scanner', {
      id: 'git-scanner',
      name: 'Git Version Scanner',
      version: '2.0.4',
      status: 'disabled',
      dependencies: ['RepositoryIntelligenceEngine'],
      compatibility: '>=5.6.0',
      health: 'healthy'
    });
  }

  public install(plugin: PluginInfo): { success: boolean; error?: string } {
    // Validate version compatibility (mock regex check)
    if (!plugin.compatibility.startsWith('>=5.')) {
      return { success: false, error: `Incompatible OS version limit. Requires ${plugin.compatibility}` };
    }

    // Validate dependencies
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep) && dep !== 'RepositoryIntelligenceEngine' && dep !== 'ExperienceEngine') {
        return { success: false, error: `Missing required plugin dependency: ${dep}` };
      }
    }

    this.plugins.set(plugin.id, plugin);
    return { success: true };
  }

  public remove(id: string): void {
    this.plugins.delete(id);
  }

  public enable(id: string): boolean {
    const p = this.plugins.get(id);
    if (p) {
      p.status = 'enabled';
      return true;
    }
    return false;
  }

  public disable(id: string): boolean {
    const p = this.plugins.get(id);
    if (p) {
      p.status = 'disabled';
      return true;
    }
    return false;
  }

  public getPlugin(id: string): PluginInfo | undefined {
    return this.plugins.get(id);
  }

  public getAll(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManagerOS = new PluginManager();
export default pluginManagerOS;
