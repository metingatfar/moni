export class FolderStructureWriter {
  public planDirectories(folders: string[]): string[] {
    const plannedDirs: string[] = [];
    for (const f of folders) {
      if (!plannedDirs.includes(f)) {
        plannedDirs.push(f);
      }
    }
    return plannedDirs;
  }
}
