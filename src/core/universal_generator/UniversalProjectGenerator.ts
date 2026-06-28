import type { UniversalProjectModel } from './UniversalProjectModel';

export class UniversalProjectGenerator {
  public generateBlueprint(type: string, name: string): Partial<UniversalProjectModel> {
    const defaultModel: Partial<UniversalProjectModel> = {
      projectId: 'proj-' + Math.random().toString(36).substr(2, 9),
      projectName: name,
      modules: ['core', 'features'],
      components: ['Header', 'Footer'],
      services: ['api_client'],
      APIs: [],
      databases: [],
      tests: [],
      documentation: ['README.md']
    };

    switch (type.toLowerCase()) {
      case 'web_app':
        return {
          ...defaultModel,
          targetPlatform: 'Web',
          components: [...(defaultModel.components || []), 'Sidebar', 'Card'],
          documentation: [...(defaultModel.documentation || []), 'Architecture.md']
        };
      case 'mobile_app':
        return {
          ...defaultModel,
          targetPlatform: 'Mobile',
          components: [...(defaultModel.components || []), 'Button', 'Input'],
          services: [...(defaultModel.services || []), 'local_storage']
        };
      case 'backend_service':
        return {
          ...defaultModel,
          targetPlatform: 'Serverless',
          modules: ['controllers', 'middleware', 'routes'],
          components: [],
          services: ['database_connection', 'logger']
        };
      case 'desktop_app':
        return {
          ...defaultModel,
          targetPlatform: 'Desktop',
          components: [...(defaultModel.components || []), 'Titlebar']
        };
      case 'ai_service':
        return {
          ...defaultModel,
          targetPlatform: 'AI',
          modules: ['models', 'pipelines'],
          services: ['llm_client']
        };
      case 'api_service':
        return {
          ...defaultModel,
          targetPlatform: 'API',
          modules: ['endpoints', 'validators']
        };
      default:
        return defaultModel;
    }
  }
}
export const universalProjectGenerator = new UniversalProjectGenerator();
export default universalProjectGenerator;
