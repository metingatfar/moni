export interface FolderPlan {
  path: string;
  purpose: string;
}

export interface ModulePlan {
  name: string;
  description: string;
  files: string[];
  dependencies: string[];
}

export interface DatabasePlan {
  provider: string;
  tables: Array<{ name: string; columns: string[]; relations: string[] }>;
}

export interface APIRoutePlan {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  requestBody?: string[];
  responseBody?: string[];
}

export interface ProjectBlueprint {
  projectId: string;
  name: string;
  targetPlatform: string;
  selectedLanguage: string;
  selectedFramework: string;
  selectedArchitecture: string;
  folders: FolderPlan[];
  modules: ModulePlan[];
  apis: APIRoutePlan[];
  database: DatabasePlan;
  frontend: {
    views: string[];
    themeMode: string;
    styleMode: string;
  };
  backend: {
    language: string;
    framework: string;
    controllers: string[];
  };
  authentication: {
    provider: string;
    endpoints: string[];
    strategies: string[];
  };
  adminPanel: {
    enabled: boolean;
    pages: string[];
    actions: string[];
  };
  mobile: {
    enabled: boolean;
    platforms: string[];
    framework: string;
  };
  aiTasks: Array<{ name: string; prompt: string; agent: string }>;
  testing: {
    framework: string;
    testSuites: string[];
    coverageTargetPercent: number;
  };
  deployment: {
    target: string;
    steps: string[];
    variables: string[];
  };
}
