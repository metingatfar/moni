import type { FolderPlan } from './ProjectBlueprint';

export class FolderPlanner {
  public planFolders(framework: string): FolderPlan[] {
    const folders: FolderPlan[] = [];
    const fw = framework.toLowerCase();

    // Standard structural layouts
    folders.push({ path: 'src', purpose: 'Root directory for source files.' });
    folders.push({ path: 'src/core', purpose: 'Business logic services and entities.' });
    folders.push({ path: 'src/presentation', purpose: 'UI elements, screens, templates and styles.' });
    folders.push({ path: 'src/presentation/components', purpose: 'Reusable styling UI components.' });
    folders.push({ path: 'src/presentation/screens', purpose: 'Composite views mapping routes.' });
    folders.push({ path: 'src/data', purpose: 'Data storage adapters and APIs.' });
    folders.push({ path: 'src/data/api', purpose: 'Network route service wrappers.' });
    folders.push({ path: 'src/data/db', purpose: 'Local or remote schemas database configurations.' });
    folders.push({ path: 'src/tests', purpose: 'Unit and integration test suites folder.' });
    folders.push({ path: 'reports', purpose: 'Performance metrics and diagnostics execution reports.' });

    if (fw === 'react' || fw === 'next.js' || fw === 'nextjs') {
      folders.push({ path: 'src/app', purpose: 'App directory structure for layouts routing.' });
      folders.push({ path: 'src/app/api', purpose: 'Serverless backend routes mappings.' });
      folders.push({ path: 'src/context', purpose: 'React state managers context providers.' });
      folders.push({ path: 'public', purpose: 'Static assets, fonts, icons and media.' });
    } else if (fw === 'flutter') {
      folders.push({ path: 'lib', purpose: 'Flutter dart entry library.' });
      folders.push({ path: 'lib/models', purpose: 'Structured models for serialization.' });
      folders.push({ path: 'lib/views', purpose: 'Flutter widgets and view pages.' });
      folders.push({ path: 'lib/bloc', purpose: 'State block event emitters.' });
      folders.push({ path: 'android', purpose: 'Native Android build configurations.' });
      folders.push({ path: 'ios', purpose: 'Native iOS build configurations.' });
    }

    return folders;
  }
}
