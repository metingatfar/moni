import type { LifeModel } from '../life/LifeModel';

export class SuggestionEngine {
  public getContextualSuggestion(trigger: 'startup' | 'morning' | 'idle' | 'task_created' | 'fatigue_or_sadness', lifeModel: LifeModel): string {
    const snapshot = lifeModel.getSnapshot();

    switch (trigger) {
      case 'morning':
        return "Günaydın! Güne başlamadan önce derin bir nefes alıp bugün öncelikli yapacaklarınızı belirlemek iyi olabilir.";
      
      case 'idle':
        return "Bir süredir işlem yapmadınız, su içmek ve kısa bir esneme molası vermek odaklanmanıza yardımcı olabilir.";
      
      case 'task_created':
        return snapshot.todayTasksCount > 3
          ? "Yeni bir görev eklediniz, bugünkü iş yoğunluğunuzu dengelemek için bazı görevleri yarına ertelemeyi düşünebilirsiniz."
          : "Görev başarıyla eklendi, planlı ilerlemek hedeflerinize ulaşmanızı kolaylaştıracaktır.";
      
      case 'fatigue_or_sadness':
        return "Yorgun veya keyifsiz hissettiğinizi belirttiniz. Kendinizi çok zorlamadan hafif bir mola vermeniz ve sevdiğiniz bir dinlenme aktivitesiyle ilgilenmeniz iyi gelecektir.";
      
      case 'startup':
      default:
        return "MONI'ye tekrar hoş geldiniz! Bugün yapacaklarınızı veya hedeflerinizi gözden geçirmek ister misiniz?";
    }
  }
}
