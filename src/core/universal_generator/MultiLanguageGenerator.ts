export interface MultiLanguageStack {
  frontendLang: string;
  frontendFramework: string;
  backendLang: string;
  backendFramework: string;
  corsMappingRule: string;
}

export class MultiLanguageGenerator {
  public combineStacks(client: string, server: string): MultiLanguageStack {
    const stack: MultiLanguageStack = {
      frontendLang: 'TypeScript',
      frontendFramework: client,
      backendLang: 'Python',
      backendFramework: server,
      corsMappingRule: 'AllowAnyOrigin'
    };

    if (client.toLowerCase() === 'flutter') {
      stack.frontendLang = 'Dart';
    }

    if (server.toLowerCase() === 'asp.net core') {
      stack.backendLang = 'C#';
    } else if (server.toLowerCase() === 'nestjs') {
      stack.backendLang = 'TypeScript';
    } else if (server.toLowerCase() === 'go fiber') {
      stack.backendLang = 'Go';
    } else if (server.toLowerCase() === 'spring boot') {
      stack.backendLang = 'Java';
    }

    return stack;
  }
}
export const multiLanguageGenerator = new MultiLanguageGenerator();
export default multiLanguageGenerator;
