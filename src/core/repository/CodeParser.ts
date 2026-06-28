import fs from 'fs';
import path from 'path';

export interface ParsedSymbol {
  name: string;
  kind: 'Class' | 'Interface' | 'Type' | 'Function' | 'Method' | 'Variable' | 'Enum';
  line: number;
}

export class CodeParser {
  public parseFile(filePath: string): ParsedSymbol[] {
    const symbols: ParsedSymbol[] = [];
    const rootPath = path.resolve('.');
    const absolutePath = path.join(rootPath, filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return symbols;
    }

    try {
      const content = fs.readFileSync(absolutePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        // Simple regex-based symbol matcher
        if (line.includes('class ') && !line.includes('//')) {
          const match = line.match(/class\s+(\w+)/);
          if (match) symbols.push({ name: match[1], kind: 'Class', line: lineNum });
        }
        if (line.includes('interface ') && !line.includes('//')) {
          const match = line.match(/interface\s+(\w+)/);
          if (match) symbols.push({ name: match[1], kind: 'Interface', line: lineNum });
        }
        if (line.includes('type ') && line.includes('=') && !line.includes('//')) {
          const match = line.match(/type\s+(\w+)/);
          if (match) symbols.push({ name: match[1], kind: 'Type', line: lineNum });
        }
        if (line.includes('function ') && !line.includes('//')) {
          const match = line.match(/function\s+(\w+)/);
          if (match) symbols.push({ name: match[1], kind: 'Function', line: lineNum });
        }
        if (line.includes('enum ') && !line.includes('//')) {
          const match = line.match(/enum\s+(\w+)/);
          if (match) symbols.push({ name: match[1], kind: 'Enum', line: lineNum });
        }
      });
    } catch (_) {}

    return symbols;
  }
}

export const codeParser = new CodeParser();
export default codeParser;
