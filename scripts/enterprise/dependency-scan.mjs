import { dependencyScanner } from '../../src/core/enterprise/DependencyScanner.ts';

console.log('Scanning package configurations, vulnerabilities, and deprecated versions...');
const report = dependencyScanner.scanDependencies();
console.log('--- Dependency Scan Report ---');
console.log(`Node.js Version: ${report.nodeVersion}`);
console.log(`TypeScript: ${report.typescriptVersion}`);
console.log(`Vite: ${report.viteVersion}`);
console.log(`React: ${report.reactVersion}`);
console.log(`Capacitor: ${report.capacitorVersion}`);
console.log(`Gemini SDK: ${report.geminiSdkVersion}`);
console.log(`Groq SDK: ${report.groqSdkVersion}`);
console.log(`Deepgram SDK: ${report.deepgramSdkVersion}`);
console.log(`ElevenLabs SDK: ${report.elevenLabsSdkVersion}`);
console.log(`Vulnerabilities Found: ${report.vulnerabilitiesFound}`);
console.log(`Outdated Dependencies: ${report.outdatedDependenciesCount}`);
