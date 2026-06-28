export interface EdgeCaseScenario {
  parameterName: string;
  value: any;
  expectedOutcome: string;
}

export class EdgeCaseGenerator {
  public generateEdgeCases(targetModuleName: string): EdgeCaseScenario[] {
    const scenarios: EdgeCaseScenario[] = [
      { parameterName: 'id', value: null, expectedOutcome: 'Throw validation schema error' },
      { parameterName: 'payload', value: undefined, expectedOutcome: 'Reject with 400 Bad Request' },
      { parameterName: 'itemsList', value: [], expectedOutcome: 'Return empty collection cleanly' },
      { parameterName: 'concurrency', value: 'concurrent_requests', expectedOutcome: 'Ensure transactional lock consistency' }
    ];

    if (targetModuleName.toLowerCase().includes('auth')) {
      scenarios.push({ parameterName: 'token', value: 'expired_jwt_token', expectedOutcome: 'Throw 401 Unauthorized status' });
    }

    return scenarios;
  }
}

export const edgeCaseGenerator = new EdgeCaseGenerator();
export default edgeCaseGenerator;
