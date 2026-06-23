export class GoalPlanner {
    travelTriggers = ['gidiyorum', 'seyahat', 'uçuş', 'bilet', 'otel', 'yolculuk', 'ankara', 'istanbul', 'izmir'];
    isMultiStepGoal(text) {
        return this.travelTriggers.some(trigger => text.includes(trigger));
    }
    async generateGoalPlan(text, _context) {
        const textLower = text.toLowerCase();
        const steps = [];
        const recommendations = [];
        if (textLower.includes('ankara') || textLower.includes('gidiyorum')) {
            steps.push({
                action: 'create_task',
                type: 'task',
                payload: { title: 'Seyahat bavulunu hazırla', priority: 'medium' }
            });
            steps.push({
                action: 'create_reminder',
                type: 'reminder',
                payload: { title: 'Yola çıkmadan önce biletleri kontrol et', time: '09:00' }
            });
            recommendations.push('Ankara seyahatiniz için hava durumunu kontrol etmenizi ve kalacağınız otel rezervasyonunu doğrulamanızı öneririm.', 'Seyahat öncesi yapılacaklar listenize bavul hazırlama görevi eklendi.');
        }
        else {
            steps.push({
                action: 'create_task',
                type: 'task',
                payload: { title: 'Seyahat planı detaylarını çıkar', priority: 'low' }
            });
            recommendations.push('Seyahat rotanızı oluşturup takviminize işleyebilirsiniz.');
        }
        return { steps, recommendations };
    }
}
