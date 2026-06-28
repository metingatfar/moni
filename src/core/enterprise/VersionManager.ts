export class VersionManager {
  private versionInfo = {
    appVersion: '1.0.0-EE',
    sprintVersion: 'Sprint 3.6.2',
    architectureVersion: 'EE-v3',
    schemaVersion: 'schema-v2',
    buildNumber: 147,
    compatibilityMatrix: {
      minCompatibleSchema: 'schema-v1',
      minCompatibleArchitecture: 'EE-v1'
    },
    ownerId: 'usr-metin-gatfar',
    preferredName: 'Metin GATFAR',
    projectId: 'moni-ai-os',
    privacyMode: 'private_owner_only',
    identitySource: 'owner_profile'
  };

  public getVersionInfo() {
    return { ...this.versionInfo };
  }

  public isCompatible(schema: string, arch: string): boolean {
    return schema >= this.versionInfo.compatibilityMatrix.minCompatibleSchema &&
           arch >= this.versionInfo.compatibilityMatrix.minCompatibleArchitecture;
  }
}
export const versionManager = new VersionManager();
export default versionManager;
