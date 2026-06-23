export interface RankedFact {
  topic: string;
  category: string;
  importanceStars: number; // 1 to 5 stars
  score: number;
}

export class KnowledgeRanker {
  /**
   * Evaluates importance of a fact and returns star ranking (1-5) and numerical score.
   */
  public rankFact(category: string, content: string): RankedFact {
    let importanceStars = 2;
    const lowerCategory = category.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Determine stars based on category
    if (lowerCategory === 'identity' || lowerCategory.includes('kimlik')) {
      importanceStars = 5;
    } else if (lowerCategory === 'health' || lowerCategory.includes('sağlık') || lowerCategory.includes('saglik')) {
      importanceStars = 5;
    } else if (lowerCategory === 'project' || lowerCategory.includes('proje') || lowerCategory === 'work') {
      importanceStars = 4;
    } else if (lowerCategory === 'sport' || lowerCategory === 'preference' || lowerCategory === 'routine') {
      importanceStars = 3;
    } else if (lowerCategory === 'general' || lowerCategory === 'custom') {
      importanceStars = 2;
    }

    // Boost based on content keywords
    if (lowerContent.includes('ilaç') || lowerContent.includes('alerji') || lowerContent.includes('önemli')) {
      importanceStars = Math.min(5, importanceStars + 1);
    }

    return {
      topic: category,
      category,
      importanceStars,
      score: importanceStars * 20 // scale to 0-100
    };
  }
}
