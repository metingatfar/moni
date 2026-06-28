import type { APIRoutePlan } from './ProjectBlueprint';

export class APIPlanner {
  public planAPIs(userInput: string): APIRoutePlan[] {
    const routes: APIRoutePlan[] = [];
    const lower = userInput.toLowerCase();

    // Standard API Routes
    routes.push({
      path: '/api/v1/users/profile',
      method: 'GET',
      description: 'Retrieve logged-in user profile details.'
    });

    routes.push({
      path: '/api/v1/users/profile',
      method: 'POST',
      description: 'Update user profile specifications.',
      requestBody: ['displayName', 'avatarUrl', 'preferences']
    });

    if (lower.includes('fitness') || lower.includes('health')) {
      routes.push({
        path: '/api/v1/workouts',
        method: 'GET',
        description: 'Get user workout routine list.'
      });
      routes.push({
        path: '/api/v1/workouts',
        method: 'POST',
        description: 'Log a new workout execution session.',
        requestBody: ['workoutName', 'durationMinutes', 'caloriesBurned', 'date']
      });
      routes.push({
        path: '/api/v1/meals',
        method: 'POST',
        description: 'Log calorie macro meal intakes.',
        requestBody: ['mealType', 'calories', 'proteinGrams']
      });
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('enterprise')) {
      routes.push({
        path: '/api/v1/inventory',
        method: 'GET',
        description: 'List current stock items availability.'
      });
      routes.push({
        path: '/api/v1/transactions',
        method: 'POST',
        description: 'Commit a stock transaction order.',
        requestBody: ['itemId', 'quantityDelta', 'type']
      });
    } else {
      routes.push({
        path: '/api/v1/records',
        method: 'POST',
        description: 'Insert raw application data payload.',
        requestBody: ['payload']
      });
    }

    routes.push({
      path: '/api/v1/analytics/export',
      method: 'GET',
      description: 'Download CSV file format summary analytics.'
    });

    return routes;
  }
}
