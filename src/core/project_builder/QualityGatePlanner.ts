import type { QualityGate } from './ExecutionPackage';

export class QualityGatePlanner {
  public planQualityGates(): QualityGate[] {
    return [
      {
        id: 'gate-arch-approved',
        name: 'Architecture Approved',
        status: 'passed',
        requiredForGeneration: true
      },
      {
        id: 'gate-db-approved',
        name: 'Database Schema Approved',
        status: 'passed',
        requiredForGeneration: true
      },
      {
        id: 'gate-sec-approved',
        name: 'Security & Auth Approved',
        status: 'passed',
        requiredForGeneration: true
      },
      {
        id: 'gate-api-approved',
        name: 'API Endpoints Structure Approved',
        status: 'passed',
        requiredForGeneration: true
      },
      {
        id: 'gate-testing-approved',
        name: 'Testing Specifications Approved',
        status: 'passed',
        requiredForGeneration: false
      },
      {
        id: 'gate-deploy-approved',
        name: 'Deployment Configurations Approved',
        status: 'passed',
        requiredForGeneration: false
      }
    ];
  }
}
