import type { ScoredTodo } from './PriorityEngine';
import type { Reminder } from '../domain/entities/Reminder';

/**
 * @deprecated Use Planner and ExecutiveBrain instead.
 */
export class RecommendationEngine {
  /**
   * Generates actionable suggestions in Turkish based on current tasks and agenda.
   */
  public static generateRecommendations(
    scoredTodos: ScoredTodo[],
    reminders: Reminder[]
  ): string[] {
    const recommendations: string[] = [];
    const now = new Date();

    const incompleteTodos = scoredTodos.filter(t => !t.isCompleted);
    const todayReminders = reminders.filter(r => {
      const d = new Date(r.dateTime);
      return this.isSameDay(d, now) && !r.isCompleted;
    });

    // 1. Check for critical overdue or high priority tasks
    if (incompleteTodos.length > 0) {
      const topTodo = incompleteTodos[0];
      
      if (topTodo.score >= 90) {
        recommendations.push(
          `Bugün öncelikle "${topTodo.task}" işini tamamlamanı öneririm. Bu görev oldukça kritik ve aciliyet kazanmış durumda.`
        );
      } else if (topTodo.score >= 50) {
        recommendations.push(
          `Günün ana odak noktası olarak "${topTodo.task}" görevini seçtim. Bunu bitirmek diğer işlerini kolaylaştıracaktır.`
        );
      } else {
        recommendations.push(
          `Bugün çok acil bir işin bulunmuyor. Düşük öncelikli olan "${topTodo.task}" görevini aradan çıkarabilirsin.`
        );
      }
    }

    // 2. Check for calendar workload and meetings
    if (todayReminders.length > 0) {
      recommendations.push(
        `Bugün ajandanda ${todayReminders.length} toplantı/randevu bulunuyor. Zamanını planlarken bu saatleri dikkate almalısın.`
      );

      // Find if any meeting starts in the next 2 hours
      const upcoming = todayReminders.find(r => {
        const timeDiff = new Date(r.dateTime).getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000;
      });

      if (upcoming) {
        const timeStr = new Date(upcoming.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        recommendations.push(
          `Yaklaşan saat ${timeStr}'daki "${upcoming.title}" toplantısına hazırlık yapmanı öneririm.`
        );
      }
    }

    // 3. Workload overload warning
    const criticalCount = incompleteTodos.filter(t => t.priority === 'high').length;
    if (criticalCount > 3) {
      recommendations.push(
        `Yapılacaklar listende ${criticalCount} adet yüksek öncelikli görev birikmiş. Yeni görev almak yerine mevcutları eritmelisin.`
      );
    }

    // 4. Recommendation to postpone low-priority items if calendar is packed
    if (todayReminders.length >= 3 && incompleteTodos.length > 0) {
      const lowPriorityTodo = [...incompleteTodos].reverse().find(t => t.priority === 'low');
      if (lowPriorityTodo) {
        recommendations.push(
          `Bugün toplantı yoğunluğun fazla olduğu için "${lowPriorityTodo.task}" görevini yarına erteleyebilirsin.`
        );
      }
    }

    // 5. If everything is done
    if (incompleteTodos.length === 0 && todayReminders.length === 0) {
      recommendations.push(
        "Tebrikler! Bugün yapılması gereken tüm acil görevleri tamamladın. Günü planlamak veya dinlenmek için harika bir gün."
      );
    } else if (incompleteTodos.length === 0) {
      recommendations.push(
        "Yapılacaklar listen tamamen boş! Bugünkü toplantılarını tamamlayıp yeni hedefler belirleyebilirsin."
      );
    }

    // Ensure we return at least 2 recommendations if possible, or limit to max 3
    return recommendations.slice(0, 3);
  }

  private static isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
