export class RepositoryGenerator {
  public generateRepository(modelName: string): string {
    return `import { PrismaClient } from '@prisma/client';\n\nexport class ${modelName}Repository {\n  private prisma = new PrismaClient();\n\n  async findById(id: string) {\n    return this.prisma.${modelName.toLowerCase()}.findUnique({ where: { id } });\n  }\n}\n`;
  }
}
