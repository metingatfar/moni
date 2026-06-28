export class RESTGenerator {
  public generateREST(routePath: string, method: string): string {
    return `app.${method.toLowerCase()}('${routePath}', (req, res) => {\n  res.json({ message: 'REST API response' });\n});\n`;
  }
}
