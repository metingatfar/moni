export class TemplateEngine {
  private templates: Map<string, string> = new Map();

  constructor() {
    this.templates.set('nextjs', `export default function Page() {\n  return <div>NextJS Generated Screen</div>;\n}`);
    this.templates.set('react', `export const Component = () => {\n  return <div>React Generated Component</div>;\n};`);
    this.templates.set('fastapi', `from fastapi import FastAPI\napp = FastAPI()\n@app.get("/")\ndef read_root():\n    return {"Hello": "World"}`);
  }

  public getTemplate(key: string): string {
    return this.templates.get(key.toLowerCase()) || `// Default fallback code structure for ${key}`;
  }
}
