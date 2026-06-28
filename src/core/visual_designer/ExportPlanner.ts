export interface ExportPlan {
  framework: string;
  filesProposed: string[];
  dependencyMap: Record<string, string>;
  isMocked: boolean;
}

export class ExportPlanner {
  public planExport(framework: string, screens: string[]): ExportPlan {
    const filesProposed = ['App.js', 'index.css'];
    const dependencyMap: Record<string, string> = {};

    if (framework === 'React') {
      dependencyMap['lucide-react'] = '^0.300.0';
      dependencyMap['@radix-ui/react-dialog'] = '^1.0.0';
      screens.forEach(s => filesProposed.push(`components/${s.replace(/\s+/g, '')}.jsx`));
    } else if (framework === 'Flutter') {
      filesProposed.push('pubspec.yaml', 'lib/main.dart');
      screens.forEach(s => filesProposed.push(`lib/screens/${s.toLowerCase().replace(/\s+/g, '_')}_screen.dart`));
    }

    return {
      framework,
      filesProposed,
      dependencyMap,
      isMocked: true
    };
  }
}
