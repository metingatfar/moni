import type { Goal } from './Goal';
import type { Milestone } from './Milestone';

export class GoalPlanner {
  public planMilestones(goalId: string, title: string, category: string, deadline: string): Milestone[] {
    const milestones: Milestone[] = [];
    const text = title.toLowerCase();
    
    // Example weight-loss milestones auto-generation
    if (category === 'health' || category === 'fitness' || text.includes('kilo') || text.includes('zayıfla')) {
      const weightMatch = title.match(/(\d+)\s*kilo/);
      const targetWeight = weightMatch ? parseInt(weightMatch[1]) : 90;
      // Assume current weight is around 98 if target is less, or generate step downs
      const current = 98;
      if (targetWeight < current) {
        const step = Math.ceil((current - targetWeight) / 4);
        for (let i = 1; i <= 4; i++) {
          const val = current - step * i;
          const finalVal = val < targetWeight ? targetWeight : val;
          milestones.push({
            id: `ms-${goalId}-${i}`,
            goalId,
            title: `${finalVal} kiloya düşmek`,
            targetValue: finalVal,
            currentValue: current,
            status: 'pending',
            deadline
          });
        }
      } else {
        milestones.push({
          id: `ms-${goalId}-1`,
          goalId,
          title: `Hedef ağırlığa ulaşmak (${targetWeight} kg)`,
          targetValue: targetWeight,
          currentValue: current,
          status: 'pending',
          deadline
        });
      }
    } else if (category === 'learning' || text.includes('çalış') || text.includes('öğren')) {
      // Learning milestones
      milestones.push(
        { id: `ms-${goalId}-1`, goalId, title: "Başlangıç seviyesi & kelime pratiği", targetValue: 100, currentValue: 0, status: 'pending', deadline },
        { id: `ms-${goalId}-2`, goalId, title: "Haftalık hedefleri %80 tamamlamak", targetValue: 100, currentValue: 0, status: 'pending', deadline },
        { id: `ms-${goalId}-3`, goalId, title: "Akıcı okuma ve konuşma pratiği", targetValue: 100, currentValue: 0, status: 'pending', deadline }
      );
    } else {
      // General fallback milestone
      milestones.push({
        id: `ms-${goalId}-1`,
        goalId,
        title: "İlk adımı tamamlamak",
        targetValue: 100,
        currentValue: 0,
        status: 'pending',
        deadline
      });
    }

    return milestones;
  }

  public suggestTasksAndReminders(goal: Goal) {
    const text = goal.title.toLowerCase();
    const suggestions = {
      tasks: [] as any[],
      reminders: [] as any[],
      calendar: [] as any[]
    };

    if (goal.category === 'health' || goal.category === 'fitness' || text.includes('kilo')) {
      suggestions.tasks.push({ title: 'Günlük su tüketimini takip et', priority: 'medium' });
      suggestions.reminders.push({ title: 'Hafif akşam yürüyüşü yap', time: '19:00' });
      suggestions.calendar.push({ title: 'Fitness Antrenmanı', duration: 45 });
    } else if (goal.category === 'learning' || text.includes('ingilizce') || text.includes('dil')) {
      suggestions.tasks.push({ title: '20 yeni kelime ezberle', priority: 'high' });
      suggestions.reminders.push({ title: 'İngilizce çalışma seansı', time: '20:30' });
      suggestions.calendar.push({ title: 'Dil Pratiği Seansı', duration: 30 });
    } else {
      suggestions.tasks.push({ title: 'Hedefe yönelik ilk görevi planla', priority: 'medium' });
    }

    return suggestions;
  }
}
