export interface FilePlan {
  path: string;
  content: string;
  sizeBytes: number;
}

export class FileWriterPlanner {
  public planFileCreation(path: string, content: string): FilePlan {
    return {
      path,
      content,
      sizeBytes: content.length
    };
  }
}
