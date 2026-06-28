export class VueGenerator {
  public generateVue(componentName: string): string {
    return `<template>\n  <div class="vue-comp">\n    <h1>${componentName} Vue Page</h1>\n  </div>\n</template>\n\n<script lang="ts">\nimport { defineComponent } from 'vue';\nexport default defineComponent({\n  name: '${componentName}'\n});\n</script>\n`;
  }
}
