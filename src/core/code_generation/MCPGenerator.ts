export class MCPGenerator {
  public generateMCPManifest(serverName: string): string {
    return `{\n  "mcpServers": {\n    "${serverName}": {\n      "command": "node",\n      "args": ["dist/server.js"],\n      "env": {}\n    }\n  }\n}\n`;
  }
}
