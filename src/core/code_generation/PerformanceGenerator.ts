export class PerformanceGenerator {
  public planCachingPolicies(): string {
    return `import Redis from 'ioredis';\n\nexport const redisCache = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');\n\nexport const cacheMiddleware = async (req: any, res: any, next: any) => {\n  const cached = await redisCache.get(req.originalUrl);\n  if (cached) return res.send(cached);\n  next();\n};\n`;
  }
}
