export class ReactGenerator {
  public generateReact(componentName: string): string {
    return `import React from 'react';\n\nexport const ${componentName} = () => {\n  return (\n    <div className="react-comp">\n      <h1>${componentName} View</h1>\n    </div>\n  );\n};\n`;
  }
}
