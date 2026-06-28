export class AuthenticationGenerator {
  public planAuthentication(authType: string): string[] {
    switch (authType.toLowerCase()) {
      case 'jwt':
        return ['auth/jwt_helper.ts', 'auth/middleware.ts'];
      case 'oauth2':
      case 'openid connect':
        return ['auth/oauth_config.ts', 'auth/callback_handler.ts'];
      case 'supabase auth':
      case 'firebase auth':
        return ['auth/cloud_provider.ts', 'auth/session_listener.ts'];
      case 'rbac':
        return ['auth/rbac_rules.json', 'auth/permission_guard.ts'];
      default:
        return ['auth/session_manager.ts'];
    }
  }
}
export const authenticationGenerator = new AuthenticationGenerator();
export default authenticationGenerator;
