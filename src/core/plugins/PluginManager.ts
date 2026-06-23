import type { MONIPlugin } from './PluginInterface';
import { PluginRegistry } from './PluginRegistry';
import { PluginLoader } from './PluginLoader';

export class PluginManager {
  private registry: PluginRegistry;
  private loader: PluginLoader;

  constructor() {
    this.registry = new PluginRegistry();
    this.loader = new PluginLoader(this.registry);
  }

  public async installAndLoad(plugin: MONIPlugin): Promise<void> {
    await this.loader.loadPlugin(plugin);
  }

  public getPlugin(name: string): MONIPlugin | undefined {
    return this.registry.get(name);
  }

  public getInstalledPlugins(): MONIPlugin[] {
    return this.registry.getAll();
  }

  public async execute(pluginName: string, action: string, params?: any): Promise<any> {
    const plugin = this.registry.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not loaded: ${pluginName}`);
    }
    return await plugin.execute(action, params);
  }

  public async unload(name: string): Promise<void> {
    const plugin = this.registry.get(name);
    if (plugin) {
      await plugin.shutdown();
      this.registry.remove(name);
      console.log(`[PluginManager] Unloaded plugin: ${name}`);
    }
  }
}
export const pluginManager = new PluginManager();
