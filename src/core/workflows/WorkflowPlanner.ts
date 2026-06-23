import type { Workflow } from './Workflow';

export class WorkflowPlanner {
  public planFromNaturalLanguage(userInput: string, goalId?: string): Workflow {
    const text = userInput.toLowerCase();
    const id = `wf-${Date.now()}`;
    
    let title = "Özel İş Akışı";
    let description = "Kullanıcı tanımlı otomatik iş akışı.";
    let triggerType: any = 'manual';
    let cron = '';
    let actions: any[] = [];

    if (text.includes('beni motive et') || text.includes('motive et')) {
      title = "Günlük Motivasyon Akışı";
      description = "Her sabah motivasyonel bir sesli mesaj okur.";
      triggerType = 'time';
      cron = "0 9 * * *";
      actions = [{
        type: 'speakMessage',
        params: { message: "Günaydın! Harika bir gün geçirmek sizin elinizde. MONI yanınızda!" }
      }];
    } else if (text.includes('yürüyüş hatırlat') || text.includes('yürüyüş')) {
      title = "Yürüyüş Bildirim Akışı";
      description = "Haftada üç gün yürüyüş yapmayı hatırlatır.";
      triggerType = 'time';
      cron = "0 18 * * 1,3,5"; // Mon, Wed, Fri
      actions = [{
        type: 'createReminder',
        params: { title: "Yürüyüş Zamanı!", time: "18:00" }
      }];
    } else if (text.includes('kilomu sor') || text.includes('kilo sor')) {
      title = "Kilo Takip Akışı";
      description = "Her pazartesi kilonuzu sorgular.";
      triggerType = 'time';
      cron = "0 9 * * 1"; // Mon
      actions = [{
        type: 'speakMessage',
        params: { message: "Yeni bir hafta başladı. Güncel kilonuzu kaydetmek ister misiniz?" }
      }];
    } else if (text.includes('ilaçlarımı hatırlat') || text.includes('ilaç')) {
      title = "İlaç Hatırlatma Akışı";
      description = "Her akşam ilaç saatinizi hatırlatır.";
      triggerType = 'time';
      cron = "0 21 * * *";
      actions = [{
        type: 'createReminder',
        params: { title: "İlaçlarınızı almayı unutmayın.", time: "21:00" }
      }];
    } else if (text.includes('haftalık rapor') || text.includes('cuma')) {
      title = "Haftalık Yaşam Raporu";
      description = "Her cuma haftalık gelişim ve hedeflerinizi raporlar.";
      triggerType = 'time';
      cron = "0 17 * * 5"; // Friday 5 PM
      actions = [{
        type: 'speakMessage',
        params: { message: "Bu hafta hedeflerinize ulaşmak için gösterdiğiniz gelişim oranlarını hazırladım." }
      }];
    } else if (text.includes('günlük planımı oku') || text.includes('planımı oku')) {
      title = "Günlük Plan Okuma Akışı";
      description = "Her sabah günlük plan ve ajandayı seslendirir.";
      triggerType = 'time';
      cron = "0 8 * * *";
      actions = [{
        type: 'speakMessage',
        params: { message: "Günaydın, bugün takviminizde 2 toplantı ve tamamlanması gereken 3 görev bulunuyor." }
      }];
    } else {
      // Default fallback
      title = `Workflow: ${userInput}`;
      triggerType = 'manual';
      actions = [{
        type: 'sendNotification',
        params: { title: "İş Akışı Tetiklendi", message: description }
      }];
    }

    return {
      id,
      title,
      description,
      trigger: {
        type: triggerType,
        config: { cron, goalId }
      },
      conditions: [],
      actions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      requiresConfirmation: true // Safe default
    };
  }

  public planGoalRecommendations(goalId: string, goalTitle: string): Workflow[] {
    // Generate recommended workflows for newly created goals
    const id1 = `wf-rec-${goalId}-1`;
    const id2 = `wf-rec-${goalId}-2`;

    return [
      {
        id: id1,
        title: `Haftalık ${goalTitle} Değerlendirmesi`,
        description: `Her pazar "${goalTitle}" hedefindeki gelişimi ve milestones tamamlanmasını analiz eder.`,
        trigger: { type: 'time', config: { cron: "0 20 * * 0", goalId } },
        conditions: [],
        actions: [
          { type: 'speakMessage', params: { message: `"${goalTitle}" hedefindeki haftalık gelişim durumunuzu kontrol ediyorum.` } },
          { type: 'runAgent', params: { agentId: 'goal_agent' } }
        ],
        status: 'paused', // Recommend status starts paused/pending confirmation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        requiresConfirmation: true
      },
      {
        id: id2,
        title: `Günlük ${goalTitle} Pratiği`,
        description: `Hedefe yönelik günlük görevleri hatırlatır.`,
        trigger: { type: 'time', config: { cron: "0 10 * * *", goalId } },
        conditions: [],
        actions: [
          { type: 'createTask', params: { title: `Gelişim için günlük aksiyon: ${goalTitle}`, priority: 'medium' } }
        ],
        status: 'paused',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        requiresConfirmation: true
      }
    ];
  }
}
