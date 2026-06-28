import { LanguageTemplateRegistry } from './LanguageTemplateRegistry';
import { FrameworkTemplateRegistry } from './FrameworkTemplateRegistry';
import { UniversalProjectGenerator } from './UniversalProjectGenerator';
import { FolderStructureGenerator } from './FolderStructureGenerator';
import { DependencyResolver } from './DependencyResolver';
import { CodeConventionEngine } from './CodeConventionEngine';
import { MultiLanguageGenerator } from './MultiLanguageGenerator';
import { APIProjectGenerator } from './APIProjectGenerator';
import { DatabaseProjectGenerator } from './DatabaseProjectGenerator';
import { AuthenticationGenerator } from './AuthenticationGenerator';
import { DocumentationGeneratorV2 } from './DocumentationGeneratorV2';
import { ProjectValidatorV2 } from './ProjectValidatorV2';
import { UniversalGenerationMetrics } from './UniversalGenerationMetrics';
import { UniversalGenerationReport } from './UniversalGenerationReport';
import type { UniversalProjectModel } from './UniversalProjectModel';

export interface PatchDraftPackage {
  success: boolean;
  projectModel: UniversalProjectModel;
  filesPlanned: string[];
  dependencies: string[];
  conventions: string[];
  apiFiles: string[];
  databaseFiles: string[];
  authFiles: string[];
  documentation: Record<string, string>;
  validationScore: number;
  report: string;
}

export class UniversalCodeGenerationEngine {
  private langRegistry = new LanguageTemplateRegistry();
  private fwRegistry = new FrameworkTemplateRegistry();
  private projGenerator = new UniversalProjectGenerator();
  private folderGen = new FolderStructureGenerator();
  private depResolver = new DependencyResolver();
  private conventionEngine = new CodeConventionEngine();
  private multiLangGen = new MultiLanguageGenerator();
  private apiGen = new APIProjectGenerator();
  private dbGen = new DatabaseProjectGenerator();
  private authGen = new AuthenticationGenerator();
  private docsGen = new DocumentationGeneratorV2();
  private validator = new ProjectValidatorV2();
  private metrics = new UniversalGenerationMetrics();
  private reporter = new UniversalGenerationReport();

  public generateProjectPackage(
    name: string,
    stack: {
      language: string;
      framework: string;
      database: string;
      aiModel: string;
      architecture: string;
      deployment: string;
      security: string;
      devops: string;
    }
  ): PatchDraftPackage {
    // 1. Build blueprint
    const platform = stack.framework.toLowerCase() === 'flutter' || stack.framework.toLowerCase() === 'react native' ? 'mobile_app' : 'web_app';
    const blueprint = this.projGenerator.generateBlueprint(platform, name);

    // 2. Set project model
    const model: UniversalProjectModel = {
      projectId: blueprint.projectId || 'proj-id',
      projectName: name,
      targetPlatform: blueprint.targetPlatform || 'Web',
      selectedLanguage: stack.language,
      selectedFramework: stack.framework,
      selectedArchitecture: stack.architecture,
      modules: blueprint.modules || [],
      components: blueprint.components || [],
      services: blueprint.services || [],
      APIs: [stack.framework.toLowerCase() === 'fastapi' ? 'REST' : 'REST'],
      databases: [stack.database],
      tests: ['src/tests/main_test.ts'],
      documentation: ['README.md'],
      deploymentTargets: [stack.deployment],
      metadata: { security: stack.security, devops: stack.devops }
    };

    // 3. Resolve files planned
    const filesPlanned = this.folderGen.planFolderStructure(
      model.targetPlatform,
      model.modules,
      model.components,
      model.services
    );

    // Add framework files
    const frameworkFiles = this.fwRegistry.getFiles(model.selectedFramework);
    for (const fwFile of frameworkFiles) {
      if (!filesPlanned.includes(fwFile)) {
        filesPlanned.push(fwFile);
      }
    }

    // Add tests
    for (const test of model.tests) {
      if (!filesPlanned.includes(test)) {
        filesPlanned.push(test);
      }
    }

    // 4. Resolve dependencies
    const packageManager = stack.language.toLowerCase() === 'python' ? 'pip' : (stack.language.toLowerCase() === 'dart' ? 'pub' : 'npm');
    const dependencies = this.depResolver.resolveDependencies(packageManager);

    // 5. Get conventions
    const conventionKey = stack.language.toLowerCase() === 'python' ? 'pep8' : (stack.language.toLowerCase() === 'dart' ? 'flutter_lints' : 'airbnb');
    const conventions = this.conventionEngine.getRules(conventionKey);

    // 6. Subsystem generators
    const apiFiles = this.apiGen.planAPI(model.APIs[0]);
    const databaseFiles = this.dbGen.planDatabase(model.databases[0]);
    const authFiles = this.authGen.planAuthentication(model.metadata.security);

    // Add subsystem planned files to tree
    for (const file of [...apiFiles, ...databaseFiles, ...authFiles]) {
      if (!filesPlanned.includes(file)) {
        filesPlanned.push(file);
      }
    }

    // 7. Generate docs
    const docFiles = this.docsGen.generateDocs(name, [stack.language, stack.framework]);
    for (const docKey of Object.keys(docFiles)) {
      if (!filesPlanned.includes(docKey)) {
        filesPlanned.push(docKey);
      }
    }

    // 8. Run validation
    const validation = this.validator.validateProject(filesPlanned, model.modules);

    // 9. Record metrics
    this.metrics.recordGeneration(
      model.modules.length,
      model.components.length,
      model.services.length,
      model.APIs.length,
      model.tests.length,
      dependencies.length,
      validation.score
    );

    // 10. Generate report summary
    const report = this.reporter.generateReport(model, filesPlanned, dependencies, validation);

    return {
      success: true,
      projectModel: model,
      filesPlanned,
      dependencies,
      conventions,
      apiFiles,
      databaseFiles,
      authFiles,
      documentation: docFiles,
      validationScore: validation.score,
      report
    };
  }

  // Getters for unit tests
  public getLangRegistry() { return this.langRegistry; }
  public getFwRegistry() { return this.fwRegistry; }
  public getProjGenerator() { return this.projGenerator; }
  public getFolderGen() { return this.folderGen; }
  public getDepResolver() { return this.depResolver; }
  public getConventionEngine() { return this.conventionEngine; }
  public getMultiLangGen() { return this.multiLangGen; }
  public getApiGen() { return this.apiGen; }
  public getDbGen() { return this.dbGen; }
  public getAuthGen() { return this.authGen; }
  public getDocsGen() { return this.docsGen; }
  public getValidator() { return this.validator; }
  public getMetrics() { return this.metrics; }
  public getReporter() { return this.reporter; }
}

export const universalCodeGenerationEngine = new UniversalCodeGenerationEngine();
export default universalCodeGenerationEngine;
