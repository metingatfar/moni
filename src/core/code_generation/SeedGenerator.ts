export class SeedGenerator {
  public generateSeed(tableName: string): string {
    return `import { PrismaClient } from '@prisma/client';\nconst prisma = new PrismaClient();\n\nasync function main() {\n  await prisma.${tableName.toLowerCase()}.create({ data: {} });\n}\n`;
  }
}
