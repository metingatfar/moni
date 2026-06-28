export class CodeTemplateEngine {
  public generateTemplate(
    type: 'class' | 'interface' | 'hook' | 'component' | 'test' | 'dto',
    name: string,
    framework: string
  ): string {
    const formattedName = name.replace(/\.[jt]sx?$/, '');
    
    switch (type) {
      case 'interface':
        return `export interface I${formattedName} {
  id: string;
  execute(params: any): Promise<any>;
}
`;
      case 'class':
        return `import { I${formattedName} } from './I${formattedName}';

export class ${formattedName} implements I${formattedName} {
  public id = '${formattedName.toLowerCase()}-id';

  public async execute(params: any): Promise<any> {
    console.log('[${formattedName}] Executing with params:', params);
    return { success: true, timestamp: new Date().toISOString() };
  }
}
`;
      case 'hook':
        return `import { useState, useEffect } from 'react';

export function use${formattedName}() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Compiled template for ${framework}
    setData({ status: 'connected' });
    setLoading(false);
  }, []);

  return { data, loading };
}
`;
      case 'test':
        return `import { ${formattedName} } from '../src/core/${formattedName}';

describe('${formattedName} Unit Tests', () => {
  it('should execute successfully', async () => {
    const service = new ${formattedName}();
    const result = await service.execute({});
    expect(result.success).toBe(true);
  });
});
`;
      default:
        return `// DTO / Template file: ${formattedName} for ${framework}\nexport type ${formattedName}Data = Record<string, any>;\n`;
    }
  }
}

export const codeTemplateEngine = new CodeTemplateEngine();
export default codeTemplateEngine;
