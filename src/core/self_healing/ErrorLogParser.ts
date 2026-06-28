export interface ParsedError {
  file: string;
  line: number;
  column: number;
  symbol: string;
  errorCode: string;
  probableCause: string;
}

export class ErrorLogParser {
  public parseLog(logContent: string): ParsedError[] {
    const errors: ParsedError[] = [];
    
    // Check for TS-style error logs, e.g. "src/core/container/Bootstrap.ts(269,52): error TS2304: Cannot find name..."
    const tsRegex = /([a-zA-Z0-9_/.-]+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.*)/g;
    let match;
    
    while ((match = tsRegex.exec(logContent)) !== null) {
      const [_full, file, line, column, errorCode, message] = match;
      let symbol = '';
      if (message.includes("'")) {
        const symbolMatch = message.match(/'([^']+)'/);
        if (symbolMatch) symbol = symbolMatch[1];
      }
      
      errors.push({
        file,
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        errorCode,
        symbol,
        probableCause: message
      });
    }

    if (errors.length === 0 && logContent.trim().length > 0) {
      // Fallback parser
      errors.push({
        file: 'unknown_file.ts',
        line: 0,
        column: 0,
        errorCode: 'ERR_GENERIC',
        symbol: '',
        probableCause: logContent.trim()
      });
    }

    return errors;
  }
}

export const errorLogParser = new ErrorLogParser();
export default errorLogParser;
