import type { ProjectBlueprint } from './ProjectBlueprint';
import type { ExecutionPackage } from './ExecutionPackage';

import { ModulePlanner } from './ModulePlanner';
import { FolderPlanner } from './FolderPlanner';
import { BackendPlanner } from './BackendPlanner';
import { FrontendPlanner } from './FrontendPlanner';
import { DatabasePlanner } from './DatabasePlanner';
import { AuthenticationPlanner } from './AuthenticationPlanner';
import { APIPlanner } from './APIPlanner';
import { AdminPanelPlanner } from './AdminPanelPlanner';
import { MobilePlanner } from './MobilePlanner';
import { AITaskPlanner } from './AITaskPlanner';
import { TestingPlanner } from './TestingPlanner';
import { DeploymentPlanner } from './DeploymentPlanner';

import { ProjectDependencyGraph } from './ProjectDependencyGraph';
import { BuildPipelinePlanner } from './BuildPipelinePlanner';
import { ProjectTimelinePlanner } from './ProjectTimelinePlanner';
import { RiskAssessmentPlanner } from './RiskAssessmentPlanner';
import { ProjectComplexityAnalyzer } from './ProjectComplexityAnalyzer';
import { SprintPlanner } from './SprintPlanner';
import { FeatureDependencyPlanner } from './FeatureDependencyPlanner';
import { CodingTaskGenerator } from './CodingTaskGenerator';
import { QualityGatePlanner } from './QualityGatePlanner';
import { CodeGenerationReadinessAnalyzer } from './CodeGenerationReadinessAnalyzer';
import { ProjectScaffolder } from './ProjectScaffolder';

export class ProjectBuilder {
  private modulePlanner = new ModulePlanner();
  private folderPlanner = new FolderPlanner();
  private backendPlanner = new BackendPlanner();
  private frontendPlanner = new FrontendPlanner();
  private databasePlanner = new DatabasePlanner();
  private authPlanner = new AuthenticationPlanner();
  private apiPlanner = new APIPlanner();
  private adminPlanner = new AdminPanelPlanner();
  private mobilePlanner = new MobilePlanner();
  private aiTaskPlanner = new AITaskPlanner();
  private testingPlanner = new TestingPlanner();
  private deploymentPlanner = new DeploymentPlanner();

  private dependencyGraph = new ProjectDependencyGraph();
  private buildPipelinePlanner = new BuildPipelinePlanner();
  private timelinePlanner = new ProjectTimelinePlanner();
  private riskAssessment = new RiskAssessmentPlanner();
  private complexityAnalyzer = new ProjectComplexityAnalyzer();
  private sprintPlanner = new SprintPlanner();
  private featureDependencyPlanner = new FeatureDependencyPlanner();
  private codingTaskGenerator = new CodingTaskGenerator();
  private qualityGatePlanner = new QualityGatePlanner();
  private readinessAnalyzer = new CodeGenerationReadinessAnalyzer();
  private scaffolder = new ProjectScaffolder();

  public buildProject(
    userInput: string,
    projectName: string,
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
  ): ExecutionPackage {
    const folders = this.folderPlanner.planFolders(stack.framework);
    const modules = this.modulePlanner.planModules(userInput);
    const apis = this.apiPlanner.planAPIs(userInput);
    const database = this.databasePlanner.planDatabase(userInput, stack.database);
    const frontend = this.frontendPlanner.planFrontend(userInput, stack.framework);
    const backend = this.backendPlanner.planBackend(stack.framework);
    const authentication = this.authPlanner.planAuthentication(userInput);
    const adminPanel = this.adminPlanner.planAdminPanel(userInput);
    const mobile = this.mobilePlanner.planMobile(userInput, stack.framework);
    const aiTasks = this.aiTaskPlanner.planAITasks(userInput, stack.aiModel);
    const testing = this.testingPlanner.planTesting(userInput, stack.framework);
    const deployment = this.deploymentPlanner.planDeployment(userInput, stack.deployment);

    const blueprint: ProjectBlueprint = {
      projectId: `blueprint-${Date.now()}`,
      name: projectName,
      targetPlatform: mobile.enabled ? 'Mobile' : 'Web',
      selectedLanguage: stack.language,
      selectedFramework: stack.framework,
      selectedArchitecture: stack.architecture,
      folders,
      modules,
      apis,
      database,
      frontend,
      backend,
      authentication,
      adminPanel,
      mobile,
      aiTasks,
      testing,
      deployment
    };

    // Run validations
    const validation = this.scaffolder.validateBlueprint(blueprint);

    const graph = this.dependencyGraph.buildGraph(blueprint);
    const buildPipeline = this.buildPipelinePlanner.planBuildPipeline(stack.framework);
    const timeline = this.timelinePlanner.planTimeline(userInput);
    const risks = this.riskAssessment.assessRisks(userInput);
    const complexity = this.complexityAnalyzer.analyzeComplexity(
      modules.length,
      apis.length,
      database.tables.length,
      aiTasks.length
    );
    const sprints = this.sprintPlanner.planSprints(userInput);
    const featureDependencies = this.featureDependencyPlanner.planDependencies(userInput);
    const codingTasks = this.codingTaskGenerator.generateTasks(userInput);
    const qualityGates = this.qualityGatePlanner.planQualityGates();
    const readinessScore = this.readinessAnalyzer.calculateReadiness(qualityGates, risks);

    return {
      requestId: `pkg-${Date.now()}`,
      userInput,
      blueprint,
      dependencyGraph: graph,
      buildPipeline,
      timeline,
      risks,
      complexity,
      sprints,
      featureDependencies,
      codingTasks,
      qualityGates,
      readinessScore,
      approved: validation.valid && readinessScore > 75
    };
  }
}
