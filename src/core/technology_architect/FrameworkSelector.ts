import type { ProjectRequirements } from './RequirementAnalyzer';
import type { DecisionOutcome } from './LanguageSelector';

export class FrameworkSelector {
  public selectFramework(requirements: ProjectRequirements, language: string): DecisionOutcome {
    const reasons: string[] = [];
    let framework = 'Next.js';
    let confidence = 85;

    if (language === 'Dart') {
      framework = 'Flutter';
      confidence = 95;
      reasons.push('Flutter enables cross-platform compilation from a single codebase.', 'Pixel-perfect rendering on both Android and iOS viewports.');
    } else if (language === 'Python') {
      framework = 'FastAPI';
      confidence = 90;
      reasons.push('FastAPI is modern, fast (high performance), and automatically documents APIs with OpenAPI.', 'Ideal for building microservices that serve AI model endpoints.');
    } else if (language === 'Go') {
      framework = 'Go Fiber';
      confidence = 88;
      reasons.push('Fiber is an Expressjs inspired web framework built on top of Fasthttp.', 'Extremely fast routing engine matching high scaling traffic requirements.');
    } else if (language === 'C#') {
      framework = 'ASP.NET Core';
      confidence = 92;
      reasons.push('ASP.NET Core provides robust, secure HTTP service architectures.', 'Built-in dependency injection, authorization systems, and SQL connectors.');
    } else {
      if (requirements.category === 'backend_api') {
        framework = 'NestJS';
        confidence = 88;
        reasons.push('NestJS enforces clean architecture patterns using TypeScript decorators.', 'Modular structure prevents codebase fragmentation.');
      } else {
        reasons.push('Next.js is the premier React meta-framework supporting SSR and SSG.', 'Vercel optimization structures reduce page load latency.');
      }
    }

    return {
      selection: framework,
      confidenceScore: confidence,
      reasoning: reasons
    };
  }
}
