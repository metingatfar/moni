export interface UniversalProjectModel {
  projectId: string;
  projectName: string;
  targetPlatform: string;
  selectedLanguage: string;
  selectedFramework: string;
  selectedArchitecture: string;
  modules: string[];
  components: string[];
  services: string[];
  APIs: string[];
  databases: string[];
  tests: string[];
  documentation: string[];
  deploymentTargets: string[];
  metadata: Record<string, any>;
}
