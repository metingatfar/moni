// ===================================================================
// MONI Sprint 6.7 — PluginMarketplace.ts
// Marketplace catalog engine for plugin discovery and management.
// ===================================================================

import type { PluginCategory } from './PluginRegistry';

export interface MarketplacePlugin {
  pluginId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  tags: string[];
  rating: number;
  reviewCount: number;
  downloadCount: number;
  featured: boolean;
  verified: boolean;
  premium: boolean;
  price: number;
  icon: string;
  homepage: string;
  license: string;
  size: number;
  publishedAt: string;
  updatedAt: string;
}

export interface MarketplacePluginDetail extends MarketplacePlugin {
  screenshots: string[];
  changelog: ChangelogEntry[];
  reviews: PluginReview[];
  dependencies: string[];
  permissions: string[];
  compatibility: string;
  supportedPlatforms: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface PluginReview {
  reviewId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface MarketplaceSearchResult {
  query: string;
  results: MarketplacePlugin[];
  totalCount: number;
  page: number;
  pageSize: number;
  searchedAt: string;
}

// Built-in marketplace catalog (simulated)
const MARKETPLACE_CATALOG: MarketplacePlugin[] = [
  {
    pluginId: 'moni-openai-provider',
    name: 'OpenAI Provider',
    version: '2.1.0',
    description: 'OpenAI GPT-4 and GPT-4o integration for MONI AI orchestration',
    author: 'MONI Enterprise',
    category: 'ai-provider',
    tags: ['openai', 'gpt-4', 'ai', 'llm', 'chatgpt'],
    rating: 4.8,
    reviewCount: 245,
    downloadCount: 12500,
    featured: true,
    verified: true,
    premium: false,
    price: 0,
    icon: '🤖',
    homepage: 'https://moni.dev/plugins/openai',
    license: 'MIT',
    size: 2048000,
    publishedAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    pluginId: 'moni-anthropic-provider',
    name: 'Anthropic Claude Provider',
    version: '1.5.0',
    description: 'Anthropic Claude 3.5 Sonnet and Opus integration',
    author: 'MONI Enterprise',
    category: 'ai-provider',
    tags: ['anthropic', 'claude', 'ai', 'llm'],
    rating: 4.7,
    reviewCount: 180,
    downloadCount: 9800,
    featured: true,
    verified: true,
    premium: false,
    price: 0,
    icon: '🧠',
    homepage: 'https://moni.dev/plugins/anthropic',
    license: 'MIT',
    size: 1850000,
    publishedAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    pluginId: 'moni-postgres-connector',
    name: 'PostgreSQL Connector',
    version: '3.0.0',
    description: 'Enterprise PostgreSQL database connector with query builder and migrations',
    author: 'MONI Database Team',
    category: 'database',
    tags: ['postgresql', 'database', 'sql', 'migrations'],
    rating: 4.9,
    reviewCount: 320,
    downloadCount: 18000,
    featured: true,
    verified: true,
    premium: false,
    price: 0,
    icon: '🐘',
    homepage: 'https://moni.dev/plugins/postgres',
    license: 'Apache-2.0',
    size: 3200000,
    publishedAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  },
  {
    pluginId: 'moni-aws-cloud',
    name: 'AWS Cloud Platform',
    version: '2.0.0',
    description: 'Amazon Web Services integration with EC2, S3, Lambda, RDS, and more',
    author: 'MONI Cloud Team',
    category: 'cloud-platform',
    tags: ['aws', 'cloud', 'ec2', 's3', 'lambda', 'serverless'],
    rating: 4.6,
    reviewCount: 210,
    downloadCount: 14200,
    featured: true,
    verified: true,
    premium: true,
    price: 29.99,
    icon: '☁️',
    homepage: 'https://moni.dev/plugins/aws',
    license: 'Commercial',
    size: 5500000,
    publishedAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
  {
    pluginId: 'moni-vscode-integration',
    name: 'VS Code Integration',
    version: '1.8.0',
    description: 'Visual Studio Code editor integration for MONI development workflows',
    author: 'MONI IDE Team',
    category: 'ide-integration',
    tags: ['vscode', 'ide', 'editor', 'development'],
    rating: 4.5,
    reviewCount: 156,
    downloadCount: 11000,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '💻',
    homepage: 'https://moni.dev/plugins/vscode',
    license: 'MIT',
    size: 1500000,
    publishedAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    pluginId: 'moni-docker-deploy',
    name: 'Docker Deployment Engine',
    version: '2.2.0',
    description: 'Docker containerization and deployment automation for MONI projects',
    author: 'MONI DevOps Team',
    category: 'deployment',
    tags: ['docker', 'containers', 'deployment', 'devops', 'kubernetes'],
    rating: 4.7,
    reviewCount: 190,
    downloadCount: 13500,
    featured: true,
    verified: true,
    premium: false,
    price: 0,
    icon: '🐳',
    homepage: 'https://moni.dev/plugins/docker',
    license: 'Apache-2.0',
    size: 4200000,
    publishedAt: '2024-03-25T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z',
  },
  {
    pluginId: 'moni-eslint-analyzer',
    name: 'ESLint Code Analyzer',
    version: '1.3.0',
    description: 'Static code analysis and linting rules engine for JavaScript/TypeScript',
    author: 'MONI Quality Team',
    category: 'developer-utility',
    tags: ['eslint', 'linting', 'code-quality', 'typescript'],
    rating: 4.4,
    reviewCount: 130,
    downloadCount: 9500,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '🔍',
    homepage: 'https://moni.dev/plugins/eslint',
    license: 'MIT',
    size: 1200000,
    publishedAt: '2024-06-10T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    pluginId: 'moni-sso-enterprise',
    name: 'Enterprise SSO Gateway',
    version: '1.0.0',
    description: 'SAML/OIDC Single Sign-On integration for enterprise identity providers',
    author: 'MONI Security Team',
    category: 'enterprise-extension',
    tags: ['sso', 'saml', 'oidc', 'authentication', 'enterprise'],
    rating: 4.8,
    reviewCount: 88,
    downloadCount: 5200,
    featured: false,
    verified: true,
    premium: true,
    price: 49.99,
    icon: '🔐',
    homepage: 'https://moni.dev/plugins/sso',
    license: 'Commercial',
    size: 2800000,
    publishedAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
  },
  {
    pluginId: 'moni-prometheus-monitor',
    name: 'Prometheus Monitoring',
    version: '1.2.0',
    description: 'Prometheus metrics exporter and Grafana dashboard integration',
    author: 'MONI Observability Team',
    category: 'monitoring',
    tags: ['prometheus', 'grafana', 'monitoring', 'metrics', 'alerting'],
    rating: 4.6,
    reviewCount: 105,
    downloadCount: 7800,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '📊',
    homepage: 'https://moni.dev/plugins/prometheus',
    license: 'Apache-2.0',
    size: 1800000,
    publishedAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z',
  },
  {
    pluginId: 'moni-jest-runner',
    name: 'Jest Test Runner',
    version: '1.4.0',
    description: 'Jest test execution, coverage analysis, and watch mode integration',
    author: 'MONI Testing Team',
    category: 'testing',
    tags: ['jest', 'testing', 'coverage', 'unit-tests'],
    rating: 4.5,
    reviewCount: 140,
    downloadCount: 10200,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '🧪',
    homepage: 'https://moni.dev/plugins/jest',
    license: 'MIT',
    size: 1600000,
    publishedAt: '2024-05-20T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    pluginId: 'moni-storybook-docs',
    name: 'Storybook Documentation',
    version: '1.1.0',
    description: 'Component documentation and visual testing with Storybook integration',
    author: 'MONI Docs Team',
    category: 'documentation',
    tags: ['storybook', 'documentation', 'components', 'visual-testing'],
    rating: 4.3,
    reviewCount: 72,
    downloadCount: 4500,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '📚',
    homepage: 'https://moni.dev/plugins/storybook',
    license: 'MIT',
    size: 2100000,
    publishedAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z',
  },
  {
    pluginId: 'moni-slack-integration',
    name: 'Slack Communication Hub',
    version: '1.6.0',
    description: 'Slack workspace integration for team notifications and AI assistant access',
    author: 'MONI Comms Team',
    category: 'communication',
    tags: ['slack', 'notifications', 'team', 'communication'],
    rating: 4.4,
    reviewCount: 95,
    downloadCount: 6800,
    featured: false,
    verified: true,
    premium: false,
    price: 0,
    icon: '💬',
    homepage: 'https://moni.dev/plugins/slack',
    license: 'MIT',
    size: 1400000,
    publishedAt: '2024-06-20T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
];

export class PluginMarketplace {
  private catalog: MarketplacePlugin[] = [...MARKETPLACE_CATALOG];
  private reviews: Map<string, PluginReview[]> = new Map();

  searchPlugins(query: string): MarketplacePlugin[] {
    const q = query.toLowerCase();
    return this.catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.author.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  getFeaturedPlugins(): MarketplacePlugin[] {
    return this.catalog.filter(p => p.featured);
  }

  getPluginsByCategory(category: string): MarketplacePlugin[] {
    return this.catalog.filter(p => p.category === category);
  }

  getPluginDetails(pluginId: string): MarketplacePluginDetail | undefined {
    const plugin = this.catalog.find(p => p.pluginId === pluginId);
    if (!plugin) return undefined;

    return {
      ...plugin,
      screenshots: [`https://moni.dev/screenshots/${pluginId}/1.png`, `https://moni.dev/screenshots/${pluginId}/2.png`],
      changelog: [
        { version: plugin.version, date: plugin.updatedAt, changes: ['Performance improvements', 'Bug fixes', 'New features'] },
      ],
      reviews: this.reviews.get(pluginId) || [],
      dependencies: [],
      permissions: ['read:files', 'read:config'],
      compatibility: 'MONI 6.0+',
      supportedPlatforms: ['Windows', 'macOS', 'Linux'],
    };
  }

  submitRating(pluginId: string, rating: number, review: string): void {
    if (!this.reviews.has(pluginId)) {
      this.reviews.set(pluginId, []);
    }

    const reviewEntry: PluginReview = {
      reviewId: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: 'user-enterprise-admin',
      userName: 'Enterprise Admin',
      rating: Math.min(5, Math.max(1, rating)),
      comment: review,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };

    this.reviews.get(pluginId)!.push(reviewEntry);

    // Update catalog rating
    const plugin = this.catalog.find(p => p.pluginId === pluginId);
    if (plugin) {
      const allReviews = this.reviews.get(pluginId)!;
      plugin.rating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      plugin.reviewCount = allReviews.length;
    }

    console.log(`[PluginMarketplace] Rating submitted for ${pluginId}: ${rating}/5`);
  }

  getTopRated(limit: number = 5): MarketplacePlugin[] {
    return [...this.catalog].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  getMostDownloaded(limit: number = 5): MarketplacePlugin[] {
    return [...this.catalog].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, limit);
  }

  getCategories(): string[] {
    const cats = new Set<string>();
    this.catalog.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }

  getCatalogSize(): number {
    return this.catalog.length;
  }

  getVerifiedPlugins(): MarketplacePlugin[] {
    return this.catalog.filter(p => p.verified);
  }

  getPremiumPlugins(): MarketplacePlugin[] {
    return this.catalog.filter(p => p.premium);
  }

  getFreePlugins(): MarketplacePlugin[] {
    return this.catalog.filter(p => !p.premium);
  }

  getDiagnostics(): any {
    return {
      totalPlugins: this.catalog.length,
      featuredPlugins: this.getFeaturedPlugins().length,
      verifiedPlugins: this.getVerifiedPlugins().length,
      premiumPlugins: this.getPremiumPlugins().length,
      freePlugins: this.getFreePlugins().length,
      categories: this.getCategories(),
      totalReviews: Array.from(this.reviews.values()).flat().length,
    };
  }
}
