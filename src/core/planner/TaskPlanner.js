export class TaskPlanner {
    isTaskCommand(text) {
        const textLower = text.toLowerCase();
        return [
            'yapılacak', 'görev', 'iş ekle', 'yapılacaklar', 'todo', 'task', 'listeye ekle'
        ].some(trigger => textLower.includes(trigger));
    }
    parse(text) {
        // Basic extraction
        const title = text.replace(/(yapılacak|görev|iş ekle|yapılacaklar|todo|task|listeye ekle)/gi, '').trim();
        return {
            title: title || 'Yeni Görev',
            priority: text.toLowerCase().includes('acil') ? 'high' : 'medium'
        };
    }
}
