export interface DecomposedTask {
  id: string;
  title: string;
  subtasks: {
    id: string;
    title: string;
    isAtomic: boolean;
  }[];
}

export class TaskDecomposer {
  public decomposeTask(taskId: string, taskTitle: string): DecomposedTask {
    const lower = taskTitle.toLowerCase();

    if (lower.includes('yetkilendirme') || lower.includes('auth')) {
      return {
        id: taskId,
        title: taskTitle,
        subtasks: [
          { id: taskId + '-1', title: 'Database user tablosu oluşturulması', isAtomic: true },
          { id: taskId + '-2', title: 'Şifre hashing algoritmasının implementasyonu', isAtomic: true },
          { id: taskId + '-3', title: 'JWT / Session token katmanı', isAtomic: false },
          { id: taskId + '-4', title: 'Kullanıcı doğrulama testi yazılması', isAtomic: true }
        ]
      };
    }

    if (lower.includes('badminton')) {
      return {
        id: taskId,
        title: taskTitle,
        subtasks: [
          { id: taskId + '-1', title: 'Badminton raketlerini ve toplarını bul', isAtomic: true },
          { id: taskId + '-2', title: 'Temiz yedek havlu ve spor ayakkabısı hazırla', isAtomic: true },
          { id: taskId + '-3', title: 'Su şişesini doldur', isAtomic: true },
          { id: taskId + '-4', title: 'Ekipmanları spor çantasına yerleştir', isAtomic: true }
        ]
      };
    }

    // Default decomposition
    return {
      id: taskId,
      title: taskTitle,
      subtasks: [
        { id: taskId + '-sub-1', title: 'Detaylı analiz yapılması', isAtomic: true },
        { id: taskId + '-sub-2', title: 'Prototip kodlama adımı', isAtomic: false },
        { id: taskId + '-sub-3', title: 'Doğrulama ve testler', isAtomic: true }
      ]
    };
  }
}
