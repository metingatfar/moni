export interface ExplorerItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: ExplorerItem[];
}

export class ProjectExplorer {
  private fileTree: ExplorerItem = {
    name: 'root',
    type: 'folder',
    path: '/',
    children: [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          { name: 'App.tsx', type: 'file', path: '/src/App.tsx' },
          { name: 'main.tsx', type: 'file', path: '/src/main.tsx' }
        ]
      },
      { name: 'package.json', type: 'file', path: '/package.json' }
    ]
  };

  public getTree(): ExplorerItem {
    return this.fileTree;
  }

  public searchFiles(query: string, items = [this.fileTree]): string[] {
    const results: string[] = [];
    const search = (node: ExplorerItem) => {
      if (node.type === 'file' && node.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(node.path);
      }
      if (node.children) {
        node.children.forEach(search);
      }
    };
    items.forEach(search);
    return results;
  }
}
