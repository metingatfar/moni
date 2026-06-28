export class BackendPlanner {
  public planBackend(framework: string): { language: string; framework: string; controllers: string[] } {
    const fw = framework.toLowerCase();
    let language = 'TypeScript';
    let controllers: string[] = ['UserController', 'SessionController', 'ReportController'];

    if (fw === 'flutter' || fw === 'react native') {
      // Mobile target apps typically connect to REST frameworks
      return {
        language: 'TypeScript',
        framework: 'Express/Node.js',
        controllers: [...controllers, 'MobilePushController', 'SyncController']
      };
    }

    if (fw === 'next.js' || fw === 'nextjs') {
      language = 'TypeScript';
      controllers = [...controllers, 'MetadataController', 'ServerActionsController'];
    } else if (fw === 'fastapi') {
      language = 'Python';
      controllers = ['AuthRouter', 'UserRouter', 'AnalyticsRouter', 'DataIngestionRouter'];
    } else {
      controllers = [...controllers, 'ApiController'];
    }

    return {
      language,
      framework,
      controllers
    };
  }
}
