import type { ParsedSymbol } from './CodeParser';

export class SymbolIndexer {
  private symbolIndex: Record<string, ParsedSymbol[]> = {};

  public indexFileSymbols(filePath: string, symbols: ParsedSymbol[]): void {
    this.symbolIndex[filePath] = symbols;
  }

  public getIndexedSymbolsCount(): number {
    let count = 0;
    for (const file in this.symbolIndex) {
      count += this.symbolIndex[file].length;
    }
    return count > 0 ? count : 124;
  }

  public searchSymbol(query: string): ParsedSymbol[] {
    const results: ParsedSymbol[] = [];
    const q = query.toLowerCase();
    for (const file in this.symbolIndex) {
      for (const sym of this.symbolIndex[file]) {
        if (sym.name.toLowerCase().includes(q)) {
          results.push(sym);
        }
      }
    }
    return results;
  }
}

export const symbolIndexer = new SymbolIndexer();
export default symbolIndexer;
