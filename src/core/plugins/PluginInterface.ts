export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
}

export interface MONIPlugin {
  metadata: PluginMetadata;
  initialize(): Promise<void>;
  execute(action: string, params?: any): Promise<any>;
  shutdown(): Promise<void>;
}
