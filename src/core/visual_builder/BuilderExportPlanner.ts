import type { BuilderProject } from './BuilderProject';

export interface ExportPlan {
  projectId: string;
  projectName: string;
  targetFramework: string;
  bindableComponentsCount: number;
  tokensBoundCount: number;
  plannedFiles: { path: string; purpose: string }[];
  exportSkeletonMetadata: string;
}

export class BuilderExportPlanner {
  public generateExportPlan(project: BuilderProject, framework: BuilderProject['framework']): ExportPlan {
    const bindableComponents: string[] = [];
    let tokensCount = 0;

    project.screens.forEach(s => {
      s.components.forEach(c => {
        bindableComponents.push(c.id);
        const bound = c.properties.boundTokens;
        if (bound.background) tokensCount++;
        if (bound.color) tokensCount++;
        if (bound.padding) tokensCount++;
        if (bound.margin) tokensCount++;
        if (bound.radius) tokensCount++;
        if (bound.typography) tokensCount++;
      });
    });

    const plannedFiles: { path: string; purpose: string }[] = [];
    if (framework === 'Flutter') {
      plannedFiles.push(
        { path: 'lib/main.dart', purpose: 'Root entry and design token provider wrapper.' },
        { path: 'lib/theme/tokens.dart', purpose: 'Design System color/spacing mappings.' }
      );
      project.screens.forEach(s => {
        plannedFiles.push({ path: `lib/screens/${s.route}_view.dart`, purpose: `Visual composed widgets for ${s.name}.` });
      });
    } else {
      plannedFiles.push(
        { path: 'src/App.tsx', purpose: 'Main router and component hierarchy wrapper.' },
        { path: 'src/theme/tokens.css', purpose: 'Standard Design Token variables.' }
      );
      project.screens.forEach(s => {
        plannedFiles.push({ path: `src/pages/${s.route}.tsx`, purpose: `Composed layout component containing bindings for ${s.name}.` });
      });
    }

    return {
      projectId: project.projectId,
      projectName: project.name,
      targetFramework: framework,
      bindableComponentsCount: bindableComponents.length,
      tokensBoundCount: tokensCount,
      plannedFiles,
      exportSkeletonMetadata: JSON.stringify({
        generatedAt: new Date().toISOString(),
        framework,
        componentsCount: bindableComponents.length,
        componentTreeSchema: 'AppNode ➔ ScreenNode ➔ Widgets'
      })
    };
  }
}
