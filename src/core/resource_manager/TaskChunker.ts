export interface TaskChunk {
  id: string;
  title: string;
  estimatedTokens: number;
}

export class TaskChunker {
  public chunkRequest(request: string): TaskChunk[] {
    const chunks: TaskChunk[] = [];
    const size = request.length;

    if (size < 100) {
      chunks.push({ id: 'chunk-1', title: 'Single task phase execution', estimatedTokens: 4000 });
    } else {
      chunks.push(
        { id: 'chunk-1', title: 'Phase 1: Parse requirements and schemas', estimatedTokens: 8000 },
        { id: 'chunk-2', title: 'Phase 2: Generate draft template configurations', estimatedTokens: 12000 },
        { id: 'chunk-3', title: 'Phase 3: Run design checks and verify contrasts', estimatedTokens: 6000 }
      );
    }
    return chunks;
  }
}
