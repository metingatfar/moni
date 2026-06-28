export class PromptGenerator {
  public generatePromptTemplate(taskName: string): string {
    return `System Instruction: You are an expert agent performing ${taskName}.\n\nContext:\n{{context}}\n\nUser Prompt: {{userInput}}\n`;
  }
}
