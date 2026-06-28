export class AngularGenerator {
  public generateAngular(componentName: string): string {
    return `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${componentName.toLowerCase()}',\n  template: '<div>${componentName} View</div>'\n})\nexport class ${componentName}Component {}\n`;
  }
}
