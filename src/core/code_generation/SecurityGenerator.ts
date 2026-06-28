export class SecurityGenerator {
  public planSecurityMiddlewares(): string {
    return `import helmet from 'helmet';\nimport rateLimit from 'express-rate-limit';\n\nexport const securitySetup = (app: any) => {\n  app.use(helmet());\n  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));\n};\n`;
  }
}
