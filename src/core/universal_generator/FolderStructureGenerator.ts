export class FolderStructureGenerator {
  public planFolderStructure(
    targetPlatform: string,
    modules: string[],
    components: string[],
    services: string[]
  ): string[] {
    const paths: string[] = [];

    // Base dirs
    paths.push('src/');
    
    // Modules
    for (const mod of modules) {
      paths.push(`src/${mod}/`);
    }

    // Components
    if (components.length > 0) {
      paths.push('src/components/');
      for (const comp of components) {
        paths.push(`src/components/${comp}.tsx`);
      }
    }

    // Services
    if (services.length > 0) {
      paths.push('src/services/');
      for (const srv of services) {
        paths.push(`src/services/${srv}.ts`);
      }
    }

    // Platform folders
    if (targetPlatform.toLowerCase() === 'mobile') {
      paths.push('android/');
      paths.push('ios/');
    }

    return paths;
  }
}
export const folderStructureGenerator = new FolderStructureGenerator();
export default folderStructureGenerator;
