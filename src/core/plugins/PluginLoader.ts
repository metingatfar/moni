import type { MONIPlugin } from './PluginInterface';
import { PluginRegistry } from './PluginRegistry';
import { stateManager } from '../state/StateManager';

export class PluginLoader {
  private registry: PluginRegistry;

  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }

  public async loadPlugin(plugin: MONIPlugin): Promise<void> {
    try {
      console.log(`[PluginLoader] Loading plugin: ${plugin.metadata.name}...`);
      await plugin.initialize();
      this.registry.register(plugin);
      stateManager.recordPluginLoaded(plugin.metadata.name);
      console.log(`[PluginLoader] Loaded successfully: ${plugin.metadata.name}`);
    } catch (err) {
      console.error(`[PluginLoader] Failed to initialize: ${plugin.metadata.name}`, err);
    }
  }
}

