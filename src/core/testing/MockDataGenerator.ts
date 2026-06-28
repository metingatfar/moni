export interface GeneratedMockData {
  datasetName: string;
  payload: any;
}

export class MockDataGenerator {
  public generateMockData(scope: string): GeneratedMockData[] {
    const datasets: GeneratedMockData[] = [];

    const lowerScope = scope.toLowerCase();
    if (lowerScope.includes('auth') || lowerScope.includes('user')) {
      datasets.push({
        datasetName: 'UserAccountPayload',
        payload: {
          id: 'usr-9912',
          email: 'engineering@moni.ai',
          roles: ['administrator', 'developer'],
          status: 'active'
        }
      });
    }

    datasets.push({
      datasetName: 'APIResponsePayload',
      payload: {
        success: true,
        data: {
          itemsCount: 1,
          items: [{ id: 'item-001', value: 100 }]
        },
        timestamp: new Date().toISOString()
      }
    });

    return datasets;
  }
}

export const mockDataGenerator = new MockDataGenerator();
export default mockDataGenerator;
