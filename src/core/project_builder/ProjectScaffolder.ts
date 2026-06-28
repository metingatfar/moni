import type { ProjectBlueprint } from './ProjectBlueprint';

export class ProjectScaffolder {
  public validateBlueprint(blueprint: ProjectBlueprint): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!blueprint.name || blueprint.name.trim() === '') {
      errors.push('Validation Error: Project name cannot be empty.');
    }
    if (blueprint.folders.length === 0) {
      errors.push('Validation Error: Folder structures plan must contain at least one directory path.');
    }
    if (blueprint.modules.length === 0) {
      errors.push('Validation Error: Module structures plan must contain at least one module.');
    }
    if (blueprint.apis.length === 0) {
      errors.push('Validation Error: APIs plan must declare at least one route.');
    }
    if (blueprint.database.tables.length === 0) {
      errors.push('Validation Error: Database plan must define tables schema.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
