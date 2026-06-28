export interface StackComparison {
  primaryTech: string;
  alternativeTech: string;
  pros: string[];
  cons: string[];
  performanceScore: number; // 1-100
  learningCurve: 'easy' | 'moderate' | 'steep';
  recommendationReason: string;
}

export class TechnologyComparisonEngine {
  public compareStacks(primary: string, alternative: string): StackComparison {
    const pros: string[] = [];
    const cons: string[] = [];
    let perf = 80;
    let curve: 'easy' | 'moderate' | 'steep' = 'moderate';
    let rec = '';

    if (primary === 'Flutter' && alternative === 'React Native') {
      pros.push('Single canvas rendering engine renders uniformly.', 'Native compilation matches high frame rate expectations.');
      cons.push('Dart language community is smaller than JavaScript.', 'App bundle size is slightly larger.');
      perf = 90;
      curve = 'moderate';
      rec = 'Flutter is recommended for UI consistency, while React Native is preferred if leveraging existing React/Web developers.';
    } else if (primary === 'FastAPI' && alternative === 'ASP.NET Core') {
      pros.push('Superb JSON serialization speeds.', 'Extremely fast startup time.');
      cons.push('Dynamic Python typing increases production bug risks compared to C#.', 'Fewer default enterprise security modules.');
      perf = 88;
      curve = 'easy';
      rec = 'FastAPI is chosen for AI integrations due to library alignments, whereas ASP.NET Core dominates heavy transactional enterprise models.';
    } else if (primary === 'PostgreSQL' && alternative === 'MongoDB') {
      pros.push('Strict ACID transactions consistency.', 'Powerful indexing and joins support.');
      cons.push('Harder to scale horizontally compared to MongoDB document sharding.', 'Schema alterations require migration files.');
      perf = 92;
      curve = 'moderate';
      rec = 'PostgreSQL is highly recommended for transactional business databases, while MongoDB is excellent for unstructured document catalogs.';
    } else {
      pros.push('Widely adopted technology standard.', 'Robust developer ecosystem support.');
      cons.push('Increased configuration requirements.', 'Scaling limits under extremely high loads.');
      rec = `Primary choice ${primary} is selected due to better requirement alignments than ${alternative}.`;
    }

    return {
      primaryTech: primary,
      alternativeTech: alternative,
      pros,
      cons,
      performanceScore: perf,
      learningCurve: curve,
      recommendationReason: rec
    };
  }
}
