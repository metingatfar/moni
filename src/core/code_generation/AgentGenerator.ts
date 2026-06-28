export class AgentGenerator {
  public generateAgentModel(agentName: string): string {
    return `export class ${agentName}Agent {\n  async execute(task: string): Promise<string> {\n    return \`Agent ${agentName} executed task: \${task}\`;\n  }\n}\n`;
  }
}
