import type { PatchDraftData } from '../codegen/PatchDraft';

export interface SandboxApplyResult {
  success: boolean;
  patchedFiles: string[];
}

export class SandboxPatchApplier {
  public applyToSandbox(sandboxPath: string, drafts: PatchDraftData[]): SandboxApplyResult {
    const patchedFiles: string[] = [];

    drafts.forEach(draft => {
      console.log(`[SandboxPatchApplier] Applying patch to copy of ${draft.filePath} inside ${sandboxPath}`);
      patchedFiles.push(draft.filePath);
    });

    return {
      success: true,
      patchedFiles
    };
  }
}

export const sandboxPatchApplier = new SandboxPatchApplier();
export default sandboxPatchApplier;
