import type { ToolIntent } from './ToolIntentAnalyzer';

export interface PlannedStep {
  tool: string;
  action: string;
  params: any;
  dependsOn?: string[];
}

export class MultiToolPlanner {
  public planMultiToolExecution(intent: ToolIntent, input: string): PlannedStep[] {
    const lower = input.toLowerCase().trim();
    const steps: PlannedStep[] = [];

    // Scenario A: "Yarın badminton malzeme listesini hazırla."
    // Intent: create_checklist/create_reminder/calendar
    if (lower.includes('badminton') && lower.includes('liste')) {
      steps.push({
        tool: 'memory',
        action: 'save',
        params: { title: 'Badminton Malzeme Listesi', content: 'Raket, badminton topu, havlu, spor ayakkabısı, su.', category: 'sport' }
      });
      steps.push({
        tool: 'calendar',
        action: 'create',
        params: { title: 'Badminton Oyunu', type: 'sport', time: 'Yarın' },
        dependsOn: ['memory']
      });
      steps.push({
        tool: 'reminders',
        action: 'add',
        params: { title: 'Badminton malzemelerini hazırla!', time: 'Yarın sabah' },
        dependsOn: ['calendar']
      });
      return steps;
    }

    // Scenario B: "FitHayat geliştirme planı hazırla."
    // Goal -> Workflow -> Memory
    if (lower.includes('fithayat') && (lower.includes('plan') || lower.includes('geliştirme'))) {
      steps.push({
        tool: 'goals',
        action: 'create',
        params: { title: 'FitHayat Geliştirme Projesi', category: 'work' }
      });
      steps.push({
        tool: 'workflows',
        action: 'create',
        params: { text: 'Her cuma FitHayat ilerlemesini raporla' }
      });
      steps.push({
        tool: 'memory',
        action: 'save',
        params: { title: 'FitHayat Proje Notları', content: 'Sprint 3.0 Tool Intelligence Engine entegrasyonu tamamlanacak.', category: 'work' },
        dependsOn: ['goals']
      });
      return steps;
    }

    // Scenario C: "Her pazartesi kilomu sor."
    // Workflow + Reminder
    if (lower.includes('her pazartesi') && lower.includes('kilo')) {
      steps.push({
        tool: 'workflows',
        action: 'create',
        params: { text: 'Her pazartesi kilomu sor' }
      });
      steps.push({
        tool: 'reminders',
        action: 'add',
        params: { title: 'Pazartesi kilo ölçümü!', time: 'Her pazartesi 09:00' },
        dependsOn: ['workflows']
      });
      return steps;
    }

    // Fallback simple planning based on intent
    if (intent.intent === 'create_event') {
      steps.push({
        tool: 'calendar',
        action: 'create',
        params: intent.extractedParams
      });
    } else if (intent.intent === 'recurring_workflow') {
      steps.push({
        tool: 'workflows',
        action: 'create',
        params: intent.extractedParams
      });
    } else if (intent.intent === 'goal') {
      steps.push({
        tool: 'goals',
        action: 'create',
        params: intent.extractedParams
      });
    } else if (intent.intent === 'create_reminder') {
      steps.push({
        tool: 'reminders',
        action: 'add',
        params: intent.extractedParams
      });
    } else if (intent.intent === 'save_memory') {
      steps.push({
        tool: 'memory',
        action: 'save',
        params: intent.extractedParams
      });
    } else if (intent.intent === 'research') {
      steps.push({
        tool: 'internet',
        action: 'search',
        params: intent.extractedParams
      });
    }

    return steps;
  }
}
