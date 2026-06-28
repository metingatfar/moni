export class DiffGenerator {
  public generateDiff(original: string, updated: string): string {
    return `--- Original\n+++ Updated\n- ${original}\n+ ${updated}\n`;
  }
}
