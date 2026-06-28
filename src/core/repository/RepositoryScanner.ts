import fs from 'fs';
import path from 'path';

export interface RepositoryScanResult {
  folders: string[];
  files: string[];
  engines: string[];
  scripts: string[];
  tests: string[];
  packageJson: any;
  tsconfig: any;
  viteConfigExists: boolean;
  capacitorConfigExists: boolean;
  scanTimeMs: number;
}

export class RepositoryScanner {
  public scanRepository(): RepositoryScanResult {
    const startTime = Date.now();
    const rootPath = path.resolve('.');
    
    const folders: string[] = [];
    const files: string[] = [];
    const engines: string[] = [];
    const scripts: string[] = [];
    const tests: string[] = [];

    // Helper to walk directory safely
    const walk = (dir: string) => {
      try {
        const list = fs.readdirSync(dir);
        for (const file of list) {
          const fullPath = path.join(dir, file);
          const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
          
          // Exclude node_modules, .git, android, ios build files, dist
          if (relativePath.startsWith('node_modules') || 
              relativePath.startsWith('.git') || 
              relativePath.startsWith('dist') || 
              relativePath.startsWith('android') || 
              relativePath.startsWith('ios')) {
            continue;
          }

          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            folders.push(relativePath);
            walk(fullPath);
          } else {
            files.push(relativePath);
            
            // Categorize files
            if (relativePath.includes('Engine.ts') || relativePath.includes('Brain.ts')) {
              engines.push(relativePath);
            } else if (relativePath.startsWith('scripts/')) {
              scripts.push(relativePath);
            } else if (relativePath.startsWith('scratch/test_') || relativePath.endsWith('.test.ts') || relativePath.endsWith('.spec.ts')) {
              tests.push(relativePath);
            }
          }
        }
      } catch (e) {
        console.error('[RepositoryScanner] Error walking directory:', dir, e);
      }
    };

    walk(rootPath);

    // Read configs
    let packageJson = {};
    try {
      const packageJsonPath = path.join(rootPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      }
    } catch (_) {}

    let tsconfig = {};
    try {
      const tsconfigPath = path.join(rootPath, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      }
    } catch (_) {}

    const viteConfigExists = fs.existsSync(path.join(rootPath, 'vite.config.ts'));
    const capacitorConfigExists = fs.existsSync(path.join(rootPath, 'capacitor.config.ts'));

    return {
      folders,
      files,
      engines,
      scripts,
      tests,
      packageJson,
      tsconfig,
      viteConfigExists,
      capacitorConfigExists,
      scanTimeMs: Date.now() - startTime
    };
  }
}

export const repositoryScanner = new RepositoryScanner();
export default repositoryScanner;
