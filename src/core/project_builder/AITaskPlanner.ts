export class AITaskPlanner {
  public planAITasks(userInput: string, aiModel: string): Array<{ name: string; prompt: string; agent: string }> {
    const tasks: Array<{ name: string; prompt: string; agent: string }> = [];
    const lower = userInput.toLowerCase();

    tasks.push({
      name: 'IntentClassification',
      prompt: `Analyze user input: "${userInput}" and classify primary intent using ${aiModel}.`,
      agent: 'CognitiveLearningAgent'
    });

    if (lower.includes('fitness') || lower.includes('health')) {
      tasks.push({
        name: 'WorkoutRecommendationGeneration',
        prompt: 'Formulate personalized workout schedules based on calorie burn targets.',
        agent: 'FitnessAgent'
      });
      tasks.push({
        name: 'NutritionalAnalysis',
        prompt: 'Summarize logged meals macro-nutrients and suggest dietary corrections.',
        agent: 'HealthAgent'
      });
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('enterprise')) {
      tasks.push({
        name: 'InventoryOptimizationPredictions',
        prompt: 'Predict stock exhaustion dates and auto-generate replenishment drafts.',
        agent: 'WorkAgent'
      });
    }

    tasks.push({
      name: 'SystemLogsAnomalyDetection',
      prompt: 'Check audit logs stream for irregular patterns and highlight exceptions.',
      agent: 'NotificationAgent'
    });

    return tasks;
  }
}
