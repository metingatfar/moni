export class FlutterGenerator {
  public generateFlutter(widgetName: string): string {
    return `import 'package:flutter/material.dart';\n\nclass ${widgetName} extends StatelessWidget {\n  const ${widgetName}({Key? key}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: const Text('${widgetName}')),\n      body: const Center(child: Text('Flutter View')),\n    );\n  }\n}\n`;
  }
}
