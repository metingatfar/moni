export class AuthenticationPlanner {
  public planAuthentication(userInput: string): { provider: string; endpoints: string[]; strategies: string[] } {
    const lower = userInput.toLowerCase();
    let provider = 'JWT-Self-Hosted';
    let strategies = ['JWT Bearer Token', 'Local Username/Password'];

    if (lower.includes('oauth') || lower.includes('google') || lower.includes('apple')) {
      provider = 'OAuth2-OIDC';
      strategies = [...strategies, 'Google Sign-In OAuth2', 'Sign in with Apple'];
    }

    const endpoints = [
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/logout',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/auth/me'
    ];

    return {
      provider,
      endpoints,
      strategies
    };
  }
}
