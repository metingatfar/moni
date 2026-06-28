export class PatchGenerator {
  public generatePatch(filePath: string, changes: string): string {
    return `PATCH FILE: ${filePath}\n==================\n${changes}\n`;
  }
}
