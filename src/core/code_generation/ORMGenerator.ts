export class ORMGenerator {
  public generateORMConfig(provider: string): string {
    return `datasource db {\n  provider = "${provider}"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n`;
  }
}
