import type { LifeModel } from '../life/LifeModel';

export interface Habit {
  name: string;
  category: 'sport' | 'health' | 'work' | 'routine';
  consistency: 'high' | 'medium' | 'low';
  description: string;
}

export class HabitAnalyzer {
  public getHabits(lifeModel: LifeModel): Habit[] {
    const habits: Habit[] = [];
    const profile = lifeModel.getProfile();
    const metrics = lifeModel.getMetrics();

    // 1. Sport Habit
    if (profile.sports.activities.length > 0) {
      habits.push({
        name: 'Spor Rutini',
        category: 'sport',
        consistency: metrics.activityScore > 70 ? 'high' : 'medium',
        description: 'Haftalık spor alışkanlığınızı korumaya çalışıyorsunuz.'
      });
    }

    // 2. Medication Routine
    if (profile.health.medications.length > 0) {
      habits.push({
        name: 'Düzenli İlaç/Takviye',
        category: 'health',
        consistency: 'high',
        description: 'Sağlık durumunuzla ilgili belirlenen rutinleri takip ediyorsunuz.'
      });
    }

    // 3. Work routine
    if (profile.work.company || profile.work.role) {
      habits.push({
        name: 'Çalışma Disiplini',
        category: 'work',
        consistency: metrics.productivityScore > 75 ? 'high' : 'medium',
        description: 'İş ve proje planlamalarınızı düzenli yönettiğiniz görülüyor.'
      });
    }

    // Fallback default habits if empty
    if (habits.length === 0) {
      habits.push({
        name: 'Düzenli Takip',
        category: 'routine',
        consistency: 'medium',
        description: 'Kişisel hedeflerinizi asistanınız yardımıyla düzenleme alışkanlığı.'
      });
    }

    return habits;
  }
}
