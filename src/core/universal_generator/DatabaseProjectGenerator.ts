export class DatabaseProjectGenerator {
  public planDatabase(dbType: string): string[] {
    switch (dbType.toLowerCase()) {
      case 'sqlite':
        return ['db/sqlite.db', 'db/connection.ts', 'db/schema.sql'];
      case 'postgresql':
        return ['db/migrations/001_init.sql', 'db/pool.ts', 'db/queries.json'];
      case 'supabase':
        return ['supabase/config.toml', 'supabase/migrations/rls_policies.sql', 'supabase/functions/index.ts'];
      case 'mongodb':
        return ['db/schemas/user.js', 'db/mongo_client.ts', 'db/indexes.json'];
      case 'firebase':
        return ['firebase/firestore.rules', 'firebase/config.js'];
      case 'redis':
        return ['db/redis_client.ts', 'db/cache_config.json'];
      default:
        return ['db/schema.sql'];
    }
  }
}
export const databaseProjectGenerator = new DatabaseProjectGenerator();
export default databaseProjectGenerator;
