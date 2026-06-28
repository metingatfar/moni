export class ProjectTree {
  public generateTree(folders: string[]): string {
    const treeMap: Record<string, any> = {};

    for (const folder of folders) {
      const parts = folder.split('/');
      let current = treeMap;
      for (const part of parts) {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }

    const buildTreeString = (obj: any, indent = ''): string => {
      let result = '';
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLast = i === keys.length - 1;
        const prefix = isLast ? ' └── ' : ' ├── ';
        result += `${indent}${prefix}${key}\n`;
        const nextIndent = indent + (isLast ? '     ' : ' │   ');
        result += buildTreeString(obj[key], nextIndent);
      }
      return result;
    };

    return 'moni\n' + buildTreeString(treeMap);
  }
}

export const projectTree = new ProjectTree();
export default projectTree;
