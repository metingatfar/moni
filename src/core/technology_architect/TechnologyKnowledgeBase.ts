export interface TechnologyEntry {
  id: string;
  name: string;
  category: 'language' | 'frontend' | 'mobile' | 'backend' | 'database' | 'ai' | 'cloud' | 'devops';
  languagesSupported?: string[];
  licensing: 'open_source' | 'proprietary' | 'cloud_hosted';
}

export class TechnologyKnowledgeBase {
  private registry: TechnologyEntry[] = [
    // Languages
    { id: 'typescript', name: 'TypeScript', category: 'language', licensing: 'open_source' },
    { id: 'python', name: 'Python', category: 'language', licensing: 'open_source' },
    { id: 'dart', name: 'Dart', category: 'language', licensing: 'open_source' },
    { id: 'go', name: 'Go', category: 'language', licensing: 'open_source' },
    { id: 'rust', name: 'Rust', category: 'language', licensing: 'open_source' },
    { id: 'csharp', name: 'C#', category: 'language', licensing: 'open_source' },
    
    // Frontend
    { id: 'react', name: 'React', category: 'frontend', languagesSupported: ['typescript', 'javascript'], licensing: 'open_source' },
    { id: 'nextjs', name: 'Next.js', category: 'frontend', languagesSupported: ['typescript', 'javascript'], licensing: 'open_source' },
    { id: 'vue', name: 'Vue', category: 'frontend', languagesSupported: ['typescript', 'javascript'], licensing: 'open_source' },
    { id: 'angular', name: 'Angular', category: 'frontend', languagesSupported: ['typescript'], licensing: 'open_source' },
    
    // Mobile
    { id: 'flutter', name: 'Flutter', category: 'mobile', languagesSupported: ['dart'], licensing: 'open_source' },
    { id: 'react_native', name: 'React Native', category: 'mobile', languagesSupported: ['typescript', 'javascript'], licensing: 'open_source' },
    { id: 'swiftui', name: 'SwiftUI', category: 'mobile', languagesSupported: ['swift'], licensing: 'open_source' },
    
    // Backend
    { id: 'fastapi', name: 'FastAPI', category: 'backend', languagesSupported: ['python'], licensing: 'open_source' },
    { id: 'nestjs', name: 'NestJS', category: 'backend', languagesSupported: ['typescript'], licensing: 'open_source' },
    { id: 'aspnet_core', name: 'ASP.NET Core', category: 'backend', languagesSupported: ['csharp'], licensing: 'open_source' },
    { id: 'go_fiber', name: 'Go Fiber', category: 'backend', languagesSupported: ['go'], licensing: 'open_source' },
    
    // Databases
    { id: 'sqlite', name: 'SQLite', category: 'database', licensing: 'open_source' },
    { id: 'postgresql', name: 'PostgreSQL', category: 'database', licensing: 'open_source' },
    { id: 'mongodb', name: 'MongoDB', category: 'database', licensing: 'open_source' },
    { id: 'supabase', name: 'Supabase', category: 'database', licensing: 'open_source' },
    
    // AI
    { id: 'gemini', name: 'Google Gemini', category: 'ai', licensing: 'cloud_hosted' },
    { id: 'claude', name: 'Anthropic Claude', category: 'ai', licensing: 'cloud_hosted' },
    { id: 'gpt', name: 'OpenAI GPT', category: 'ai', licensing: 'cloud_hosted' },
    { id: 'ollama', name: 'Ollama Local', category: 'ai', licensing: 'open_source' },

    // Cloud
    { id: 'aws', name: 'Amazon Web Services', category: 'cloud', licensing: 'cloud_hosted' },
    { id: 'vercel', name: 'Vercel', category: 'cloud', licensing: 'cloud_hosted' },
    { id: 'railway', name: 'Railway', category: 'cloud', licensing: 'cloud_hosted' },

    // DevOps
    { id: 'docker', name: 'Docker', category: 'devops', licensing: 'open_source' },
    { id: 'github_actions', name: 'GitHub Actions', category: 'devops', licensing: 'proprietary' }
  ];

  public getTechnologies(): TechnologyEntry[] {
    return this.registry;
  }

  public getByCategory(category: TechnologyEntry['category']): TechnologyEntry[] {
    return this.registry.filter(t => t.category === category);
  }

  public getById(id: string): TechnologyEntry | undefined {
    return this.registry.find(t => t.id === id);
  }
}
export const technologyKnowledgeBase = new TechnologyKnowledgeBase();
export default technologyKnowledgeBase;
