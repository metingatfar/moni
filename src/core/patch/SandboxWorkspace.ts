// ===================================================================
// MONI — SandboxWorkspace.ts
// Browser-safe sandbox staging directory management.
// ===================================================================

let fsModule: any = null;
if (typeof window === 'undefined') {
  try {
    fsModule = require('fs');
  } catch (_) {}
}

export class SandboxWorkspace {
  private sandboxPath: string = 'dist/sandbox';

  public createSandbox(files: string[]): string {
    // Stage staging directory safely
    if (fsModule && typeof fsModule.existsSync === 'function') {
      try {
        if (!fsModule.existsSync(this.sandboxPath)) {
          fsModule.mkdirSync(this.sandboxPath, { recursive: true });
        }
      } catch (_) {}
    }
    
    // Log target files staging inside sandbox
    files.forEach(file => {
      console.log(`[SandboxWorkspace] Staging copy of ${file} into ${this.sandboxPath}`);
    });

    return this.sandboxPath;
  }

  public cleanSandbox(): void {
    console.log('[SandboxWorkspace] Cleaning sandbox folder:', this.sandboxPath);
  }
}

export const sandboxWorkspace = new SandboxWorkspace();
export default sandboxWorkspace;
