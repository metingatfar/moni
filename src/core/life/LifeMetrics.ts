import type { LifeProfileData } from './LifeProfile';
import type { LifeSnapshot } from './LifeSnapshot';

export interface LifeMetrics {
  healthScore: number;
  activityScore: number;
  productivityScore: number;
  consistencyScore: number;
  memoryUsageScore: number;
  conversationQualityScore: number;
  goalProgressScore: number;
  overallLifeScore: number;
}

export function calculateMetrics(profile: LifeProfileData, snapshot: LifeSnapshot): LifeMetrics {
  // 1. Health Score
  let healthScore = 80;
  if (profile.health.weight && profile.health.weight > 90) {
    healthScore -= 5;
  }
  if (profile.health.weight && profile.health.weight > 100) {
    healthScore -= 5;
  }
  if (profile.health.systolicBP && profile.health.systolicBP > 130) {
    healthScore -= 5;
  }
  if (profile.health.conditions.length > 0) {
    healthScore -= Math.min(15, profile.health.conditions.length * 5);
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  // 2. Activity Score
  let activityScore = 50;
  const sportsCount = profile.sports.activities.length;
  activityScore += sportsCount * 15;
  if (snapshot.lastSportDate) {
    const lastSport = new Date(snapshot.lastSportDate);
    const diffDays = (Date.now() - lastSport.getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 3) {
      activityScore += 10;
    } else if (diffDays > 7) {
      activityScore -= 15;
    }
  } else {
    activityScore -= 10;
  }
  activityScore = Math.max(0, Math.min(100, activityScore));

  // 3. Productivity Score
  let productivityScore = 75;
  const totalTasks = snapshot.todayTasksCount;
  if (totalTasks > 0) {
    // If we have active goals or tasks, we can calculate based on completed vs total tasks.
    // For local evaluation, we default to 75-85 but can scale.
    productivityScore = Math.min(100, 60 + (profile.goals.completedGoals.length * 10));
  }

  // 4. Consistency Score
  let consistencyScore = 70;
  if (snapshot.lastSportDate && sportsCount > 0) {
    consistencyScore += 10;
  }
  if (profile.goals.completedGoals.length > 0) {
    consistencyScore += 10;
  }
  consistencyScore = Math.max(0, Math.min(100, consistencyScore));

  // 5. Memory Usage Score
  // Score grows with stored facts, peaking at 20 stored items
  const memoryUsageScore = Math.max(0, Math.min(100, Math.round((snapshot.memoryCount / 20) * 100)));

  // 6. Conversation Quality Score
  let conversationQualityScore = 80;
  if (snapshot.conversationCount > 5) {
    conversationQualityScore += 10;
  }
  if (snapshot.lastConversationTopic !== 'chat') {
    conversationQualityScore += 5;
  }
  conversationQualityScore = Math.max(0, Math.min(100, conversationQualityScore));

  // 7. Goal Progress Score
  let goalProgressScore = 50;
  const totalGoals = profile.goals.activeGoals.length + profile.goals.completedGoals.length;
  if (totalGoals > 0) {
    goalProgressScore = Math.round((profile.goals.completedGoals.length / totalGoals) * 100);
  } else {
    goalProgressScore = 70; // default if no goals set yet
  }

  // 8. Overall Life Score (Average)
  const overallLifeScore = Math.round(
    (healthScore +
      activityScore +
      productivityScore +
      consistencyScore +
      memoryUsageScore +
      conversationQualityScore +
      goalProgressScore) /
      7
  );

  return {
    healthScore,
    activityScore,
    productivityScore,
    consistencyScore,
    memoryUsageScore,
    conversationQualityScore,
    goalProgressScore,
    overallLifeScore
  };
}
