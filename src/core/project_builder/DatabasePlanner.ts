import type { DatabasePlan } from './ProjectBlueprint';

export class DatabasePlanner {
  public planDatabase(userInput: string, provider: string): DatabasePlan {
    const lower = userInput.toLowerCase();
    const tables: DatabasePlan['tables'] = [];

    // Core tables
    tables.push({
      name: 'users',
      columns: ['id (UUID, PK)', 'email (VARCHAR, UNIQUE)', 'password_hash (VARCHAR)', 'role (VARCHAR)', 'created_at (TIMESTAMP)'],
      relations: ['1:N sessions', '1:N profiles']
    });

    tables.push({
      name: 'sessions',
      columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'token (VARCHAR)', 'expires_at (TIMESTAMP)', 'last_active (TIMESTAMP)'],
      relations: ['N:1 users']
    });

    if (lower.includes('fitness') || lower.includes('health')) {
      tables.push({
        name: 'workouts',
        columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'workout_name (VARCHAR)', 'duration_minutes (INT)', 'calories_burned (INT)', 'date (DATE)'],
        relations: ['N:1 users', '1:N exercises']
      });
      tables.push({
        name: 'meals',
        columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'meal_type (VARCHAR)', 'calories (INT)', 'protein_grams (INT)', 'logged_at (TIMESTAMP)'],
        relations: ['N:1 users']
      });
    } else if (lower.includes('erp') || lower.includes('admin') || lower.includes('enterprise')) {
      tables.push({
        name: 'inventory_items',
        columns: ['id (UUID, PK)', 'sku (VARCHAR, UNIQUE)', 'name (VARCHAR)', 'quantity (INT)', 'unit_price (DECIMAL)'],
        relations: ['1:N transactions']
      });
      tables.push({
        name: 'transactions',
        columns: ['id (UUID, PK)', 'item_id (UUID, FK)', 'user_id (UUID, FK)', 'quantity_delta (INT)', 'type (VARCHAR)', 'created_at (TIMESTAMP)'],
        relations: ['N:1 inventory_items', 'N:1 users']
      });
    } else {
      tables.push({
        name: 'custom_records',
        columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'payload (JSONB)', 'updated_at (TIMESTAMP)'],
        relations: ['N:1 users']
      });
    }

    return {
      provider,
      tables
    };
  }
}
