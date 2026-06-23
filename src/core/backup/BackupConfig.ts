export class BackupConfig {
  public static readonly INCLUDE_PATHS = [
    'src',
    'docs',
    'prompts',
    'reports',
    'package.json',
    'package-lock.json',
    'capacitor.config.json',
    'scripts'
  ];

  public static readonly EXCLUDE_PATHS = [
    'node_modules',
    'dist',
    '.env',
    '.env.local',
    '.env.production',
    'android/build',
    'ios/build',
    'backups/*.zip',
    'secrets',
    'api keys',
    'cache'
  ];

  public getIncludePaths(): string[] {
    return [...BackupConfig.INCLUDE_PATHS];
  }

  public getExcludePaths(): string[] {
    return [...BackupConfig.EXCLUDE_PATHS];
  }
}
