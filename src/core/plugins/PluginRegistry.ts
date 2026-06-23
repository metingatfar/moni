import type { MONIPlugin } from './PluginInterface';

export class PluginRegistry {
  private plugins: Map<string, MONIPlugin> = new Map();

  public register(plugin: MONIPlugin): void {
    this.plugins.set(plugin.metadata.name, plugin);
    console.log(`[PluginRegistry] Registered: ${plugin.metadata.name}`);
  }

  public get(name: string): MONIPlugin | undefined {
    return this.plugins.get(name);
  }

  public getAll(): MONIPlugin[] {
    return Array.from(this.plugins.values());
  }

  public remove(name: string): void {
    this.plugins.delete(name);
  }
}
