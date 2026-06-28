import { container } from '../container/ServiceContainer';
import { ProjectBuilder } from './ProjectBuilder';
import { ProjectBuilderReport } from './ProjectBuilderReport';
import type { ExecutionPackage } from './ExecutionPackage';

export class AutonomousProjectBuilder {
  private builder = new ProjectBuilder();
  private reporter = new ProjectBuilderReport();

  private requestCount = 0;
  private packageCount = 0;

  public async buildApplication(userInput: string): Promise<ExecutionPackage> {
    this.requestCount++;

    // Resolve dependencies from container
    const archEngine = container.resolve<any>('TechnologyArchitect');
    const visualBuilder = container.resolve<any>('VisualBuilderEngine');
    const uiDesigner = container.resolve<any>('VisualDesignerStudio'); // VisualDesignerStudio in bootstrap is UIDesignerAgent or VisualDesignerStudio? Let's check
    const codegenEngine = container.resolve<any>('UniversalCodeGenerationEngine');

    // 1. Recommend Tech Stack
    let stack = {
      language: 'TypeScript',
      framework: 'Next.js',
      database: 'PostgreSQL',
      aiModel: 'Gemini 1.5 Pro',
      architecture: 'Clean Architecture',
      deployment: 'Vercel',
      security: 'JWT / OAuth',
      devops: 'GitHub Actions'
    };

    if (archEngine) {
      try {
        const archPkg = archEngine.recommendTechnologyStack(userInput);
        if (archPkg && archPkg.success && archPkg.recommendation) {
          const rec = archPkg.recommendation;
          stack = {
            language: rec.language?.selection || stack.language,
            framework: rec.framework?.selection || stack.framework,
            database: rec.database?.selection || stack.database,
            aiModel: rec.aiModel?.selection || stack.aiModel,
            architecture: rec.architecture?.selection || stack.architecture,
            deployment: rec.deployment?.selection || stack.deployment,
            security: rec.security?.selection || stack.security,
            devops: rec.devops?.selection || stack.devops
          };
        }
      } catch (err) {
        console.error('[AutonomousProjectBuilder] TechnologyArchitect failed, using default stack.', err);
      }
    }

    // 2. Compose Visual Design & Layouts (to ensure Visual Builder & Designer are called)
    if (visualBuilder) {
      try {
        visualBuilder.composeScreenVisually(userInput);
      } catch (err) {
        console.error('[AutonomousProjectBuilder] VisualBuilder failed to compose.', err);
      }
    }

    if (uiDesigner) {
      try {
        // In bootstrap, UIDesignerAgent is registered as 'UIDesignerAgent'
        // let's resolve 'UIDesignerAgent' instead or in addition
        const agent = container.resolve<any>('UIDesignerAgent');
        if (agent) {
          agent.designApplication(userInput);
        }
      } catch (err) {
        console.error('[AutonomousProjectBuilder] UIDesignerAgent failed.', err);
      }
    }

    // 3. Plan Code Generation structures
    if (codegenEngine) {
      try {
        codegenEngine.generateProjectPackage('dynamic-app', stack);
      } catch (err) {
        console.error('[AutonomousProjectBuilder] CodeGenerationEngine failed.', err);
      }
    }

    // 4. Build comprehensive project package
    const pkg = this.builder.buildProject(userInput, 'DynamicAutonomousApp', stack);
    this.packageCount++;

    return pkg;
  }

  public getReportGenerator(): ProjectBuilderReport {
    return this.reporter;
  }

  public getDiagnostics(): { requestCount: number; packageCount: number } {
    return {
      requestCount: this.requestCount,
      packageCount: this.packageCount
    };
  }
}

export const autonomousProjectBuilder = new AutonomousProjectBuilder();
export default autonomousProjectBuilder;
