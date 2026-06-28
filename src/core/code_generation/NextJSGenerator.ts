export class NextJSGenerator {
  public generateNextJS(pageName: string): string {
    return `import React from 'react';\n\nexport default function ${pageName}Page() {\n  return (\n    <main className="next-page">\n      <h1>${pageName} Web Page</h1>\n    </main>\n  );\n}\n`;
  }
}
