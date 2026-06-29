export type IntentType =
  | 'greeting'
  | 'identity'
  | 'feature_question'
  | 'help'
  | 'system_status'
  | 'provider_status'
  | 'memory_question'
  | 'voice_question'
  | 'workspace_question'
  | 'workflow_question'
  | 'report_question'
  | 'security_question'
  | 'simple_factual'
  | 'coding_request'
  | 'creative_request'
  | 'complex_reasoning';

export class IntentDetector {
  private static instance: IntentDetector;

  private constructor() {}

  public static getInstance(): IntentDetector {
    if (!IntentDetector.instance) {
      IntentDetector.instance = new IntentDetector();
    }
    return IntentDetector.instance;
  }

  public detect(message: string): IntentType {
    const text = message.toLowerCase().trim();

    // 1. Coding request triggers (Priority)
    const codingKeywords = [
      'yaz', 'kod', 'code', 'function', 'class', 'react', 'python', 'javascript',
      'typescript', 'html', 'css', 'script', 'programming', 'programla', 'develop',
      'developer', 'api', 'json', 'sql', 'query', 'database', 'veritabanı'
    ];
    if (codingKeywords.some(kw => text.includes(kw) && text.split(' ').length > 2)) {
      return 'coding_request';
    }

    // 2. Creative request triggers
    const creativeKeywords = [
      'hikaye', 'story', 'şiir', 'poem', 'şarkı', 'song', 'fıkra', 'joke',
      'yaratıcı', 'creative', 'hayal et', 'imagine', 'mektup', 'letter'
    ];
    if (creativeKeywords.some(kw => text.includes(kw))) {
      return 'creative_request';
    }

    // 3. Complex reasoning triggers
    const reasoningKeywords = [
      'neden', 'niçin', 'nasıl çözülür', 'why', 'how to solve', 'analyze',
      'hesapla', 'calculate', 'matematik', 'math', 'ispatla', 'prove'
    ];
    if (reasoningKeywords.some(kw => text.includes(kw))) {
      return 'complex_reasoning';
    }

    // 4. Memory questions
    if (
      text.includes('hatırla') || text.includes('hafıza') || text.includes('memory') ||
      text.includes('ben kimim') || text.includes('benim hakkımda') || text.includes('what do you remember')
    ) {
      return 'memory_question';
    }

    // 5. Voice settings and voice questions
    if (
      text.includes('ses tonu') || text.includes('seslendir') || text.includes('speak') ||
      text.includes('voice') || text.includes('tts') || text.includes('oku') || text.includes('konuş')
    ) {
      return 'voice_question';
    }

    // 6. Workflow questions
    if (text.includes('workflow') || text.includes('akış') || text.includes('otomasyon') || text.includes('automation')) {
      return 'workflow_question';
    }

    // 7. Workspace and project questions
    if (text.includes('workspace') || text.includes('çalışma alanı') || text.includes('proje') || text.includes('project')) {
      return 'workspace_question';
    }

    // 8. Security questions
    if (text.includes('şifre') || text.includes('güvenlik') || text.includes('security') || text.includes('login') || text.includes('auth')) {
      return 'security_question';
    }

    // 9. Report questions
    if (text.includes('rapor') || text.includes('report') || text.includes('özet') || text.includes('brief')) {
      return 'report_question';
    }

    // 10. Provider status questions
    if (
      text.includes('api limiti') || text.includes('rate limit') || text.includes('sağlayıcı') ||
      text.includes('provider') || text.includes('groq') || text.includes('gemini') || text.includes('openai')
    ) {
      return 'provider_status';
    }

    // 11. System status questions
    if (text.includes('sistem durum') || text.includes('system health') || text.includes('sağlık') || text.includes('health check')) {
      return 'system_status';
    }

    // 12. Identity questions
    if (
      text.includes('sen kimsin') || text.includes('kendini tanıt') || text.includes('who are you') ||
      text.includes('introduce yourself') || text.includes('ismin ne') || text.includes('adın ne')
    ) {
      return 'identity';
    }

    // 13. Help questions
    if (text.includes('yardım') || text.includes('help') || text.includes('nasıl kullanılır') || text.includes('how to use')) {
      return 'help';
    }

    // 14. Greeting questions
    const greetings = [
      'merhaba', 'selam', 'hey', 'hi', 'hello', 'günaydın', 'tünaydın',
      'iyi akşamlar', 'iyi geceler', 'nasıl gidiyor', 'what\'s up'
    ];
    if (greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g))) {
      return 'greeting';
    }

    // 15. Feature questions
    if (
      text.includes('özellik') || text.includes('ne yapabilirsin') || text.includes('what can you do') ||
      text.includes('features') || text.includes('moni nedir') || text.includes('what is moni')
    ) {
      return 'feature_question';
    }

    return 'simple_factual';
  }

  public isLocalIntent(intent: IntentType): boolean {
    const localIntents: IntentType[] = [
      'greeting',
      'identity',
      'feature_question',
      'help',
      'system_status',
      'provider_status',
      'memory_question',
      'voice_question',
      'workspace_question',
      'workflow_question',
      'report_question',
      'security_question'
    ];
    return localIntents.includes(intent);
  }
}

export const intentDetector = IntentDetector.getInstance();
export default intentDetector;
