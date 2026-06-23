/// <reference types="node" />

// Mock browser global environment using globalThis
const storage: Record<string, string> = {};
const g = globalThis as any;

g.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; },
  length: 0,
  key: (index: number) => null
};

g.window = {
  dispatchEvent: () => {},
  SpeechRecognition: function() {},
  webkitSpeechRecognition: function() {},
  localStorage: g.localStorage
};

import { regressionSuite } from '../src/core/observability/RegressionSuite';

console.log('=============================================');
console.log('=== RUNNING REGRESSION SUITE UNIT TESTS ===');
console.log('=============================================');

async function test() {
  const mockExecuter = async (input: string): Promise<string> => {
    // Return values matching expected sub-words
    const lower = input.toLowerCase();
    if (lower.includes('merhaba')) return 'Merhaba Metin Bey!';
    if (lower.includes('nasılsın')) return 'Gayet iyiyim, teşekkürler!';
    if (lower.includes('şekersiz')) return 'Tercihinizi hafızama kaydettim: kahveyi şekersiz içersiniz.';
    if (lower.includes('nasıl içerim')) return 'Kahvenizi şekersiz içersiniz.';
    if (lower.includes('bozuldu')) return 'Geçmiş olsun, servise götürebilirsiniz.';
    if (lower.includes('servise')) return 'Size yardımcı olabilirim, en yakın servisleri bulayım.';
    if (lower.includes('yüzme')) return 'Yüzme aktiviteniz kaydedildi.';
    if (lower.includes('yoruldum')) return 'Dinlenmelisiniz.';
    if (lower.includes('kilomu sor')) return 'Her pazartesi kilonuzu soracak bir iş akışı planladım.';
    if (lower.includes('kiloya') || lower.includes('kilo')) return 'Kilo hedefi oluşturuldu: 90 kg hedefine ulaşmak için plan hazırlıyorum.';
    if (lower.includes('hedeflerim')) return 'Bugünkü hedef listeniz:';
    if (lower.includes('ilaç')) return 'İlaçlarınızı her akşam hatırlatacak iş akışı devrede.';
    if (lower.includes('spor yapmak')) return 'Hafif esneme hareketleri yapabilirsiniz.';
    if (lower.includes('öneri')) return 'Rica ederim, geri bildirim için teşekkürler.';
    if (lower.includes('işe yaramadı')) return 'Üzgünüm, feedback kaydettim.';
    if (lower.includes('brifing')) return 'Bugün için brifinginiz hazır.';
    if (lower.includes('risk')) return 'Sağlık durumunuz stabil, risk yok.';
    if (lower.includes('hafta') && lower.includes('nasıl')) return 'Haftalık gelişim özeti: hedeflerinize uyumunuz yüksek.';
    if (lower.includes('toplantı')) return 'Toplantı randevusu oluşturuyorum.';
    if (lower.includes('14')) return 'Saat 14:00 olarak alındı.';
    if (lower.includes('ali')) return 'Katılımcı Ali eklendi.';
    if (lower.includes('bolu')) return 'Lokasyon Bolu olarak belirlendi.';
    return 'Default fallback match';
  };

  const results = await regressionSuite.runRegression(mockExecuter);
  const failed = results.filter(r => r.status === 'failed');

  if (failed.length > 0) {
    console.error('❌ Failed: Some regression scenarios did not match expectations!');
    for (const f of failed) {
      console.log(`- Scenario: ${f.testName} | Expected: ${f.expected} | Actual: ${f.actual}`);
    }
    process.exit(1);
  }

  console.log(`✅ Success: All ${results.length} regression scenarios executed and matched.`);
  console.log('🎉 REGRESSION SUITE TESTS PASSED!');
  process.exit(0);
}

test().catch(e => {
  console.error('❌ Error executing regression unit test:', e);
  process.exit(1);
});
