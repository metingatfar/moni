export class NestGenerator {
  public generateNest(controllerName: string): string {
    return `import { Controller, Get } from '@nestjs/common';\n\n@Controller('${controllerName.toLowerCase()}')\nexport class ${controllerName}Controller {\n  @Get()\n  findAll() {\n    return [];\n  }\n}\n`;
  }
}
