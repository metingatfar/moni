export interface CompiledPrompt {
  systemPrompt: string;
  userPrompt: string;
  compiledAt: string;
}

export class PromptCompiler {
  public compilePrompt(
    request: string,
    repoContext: string,
    codeContext: string,
    manifestContext: string
  ): CompiledPrompt {
    return {
      systemPrompt: `You are MONI AI Coding Assistant. Use the provided repository and code context to fulfill the user request.
Repository Context:
${repoContext}
Code Symbols & Files:
${codeContext}
Development Manifest details:
${manifestContext}`,
      userPrompt: request,
      compiledAt: new Date().toISOString()
    };
  }
}

export const promptCompiler = new PromptCompiler();
export default promptCompiler;
