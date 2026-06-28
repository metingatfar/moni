export class ReactNativeGenerator {
  public generateReactNative(screenName: string): string {
    return `import React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nexport const ${screenName}Screen = () => {\n  return (\n    <View style={styles.container}>\n      <Text>${screenName} Mobile View</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }\n});\n`;
  }
}
