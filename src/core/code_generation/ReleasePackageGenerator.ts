export class ReleasePackageGenerator {
  public planReleaseManifest(projectName: string, version: string): string {
    return `{\n  "name": "${projectName.toLowerCase()}",\n  "version": "${version}",\n  "description": "Scaffold package generated autonomously by MONI",\n  "main": "dist/index.js"\n}\n`;
  }
}
