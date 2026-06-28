export interface AssembledContext {
  repositorySummary: string;
  codeIntelligenceSummary: string;
  manifestSummary: string;
  assemblerVersion: string;
}

export class ContextAssembler {
  public assembleContext(
    repoIntel: any,
    codeIntel: any,
    devPlan: any
  ): AssembledContext {
    return {
      repositorySummary: repoIntel ? `Repo Version: ${repoIntel.cache?.architectureVersion || '1.0.0'}` : 'No repo intel context.',
      codeIntelligenceSummary: codeIntel ? `Symbols: ${codeIntel.symbolCount || 0}` : 'No code intel context.',
      manifestSummary: devPlan?.manifest ? `Request Intent: ${devPlan.manifest.developmentIntent || 'N/A'}` : 'No development plan manifest context.',
      assemblerVersion: 'v1.0.0'
    };
  }
}

export const contextAssembler = new ContextAssembler();
export default contextAssembler;
