import type { Goal } from './Goal';

export interface GoalPrediction {
  completionProbability: number; // percentage, e.g., 82
  estimatedCompletionDate: string;
  wording: string;
}

export class GoalPredictor {
  public predictGoalCompletion(goal: Goal, lifeSnapshot: any): GoalPrediction {
    if (goal.status === 'completed') {
      return {
        completionProbability: 100,
        estimatedCompletionDate: goal.completedAt || new Date().toISOString(),
        wording: "Hedef zaten tamamlanmış görünüyor."
      };
    }

    // Default probability is around 82%
    let probability = 82;
    
    // Adjust based on today's tasks or activity score
    const activityScore = lifeSnapshot.activityScore || 80;
    if (activityScore > 85) {
      probability += 8;
    } else if (activityScore < 60) {
      probability -= 12;
    }

    // Bound probability between 10% and 95% to avoid definitive 100% statements
    probability = Math.max(10, Math.min(95, probability));

    const deadlineDate = new Date(goal.deadline);
    const estDate = new Date(Date.now() + (deadlineDate.getTime() - Date.now()) * (100 / probability));

    return {
      completionProbability: probability,
      estimatedCompletionDate: estDate.toISOString().split('T')[0],
      wording: `Mevcut ilerleme hızınız ve alışkanlıklarınız doğrultusunda, hedefinize zamanında ulaşma olasılığınız yaklaşık %${probability} seviyesinde görünüyor. İstikrarınızı korumak faydalı olabilir.`
    };
  }
}
