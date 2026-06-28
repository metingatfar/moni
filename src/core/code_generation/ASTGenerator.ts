export interface ASTNode {
  type: string;
  name: string;
  value?: any;
  children?: ASTNode[];
}

export class ASTGenerator {
  public generateAST(userInput: string): ASTNode {
    const root: ASTNode = {
      type: 'Program',
      name: 'root',
      children: []
    };

    const lower = userInput.toLowerCase();

    if (lower.includes('auth') || lower.includes('login') || true) {
      root.children?.push({
        type: 'ClassDeclaration',
        name: 'AuthService',
        children: [
          { type: 'MethodDeclaration', name: 'login', value: ['username', 'password'] },
          { type: 'MethodDeclaration', name: 'register', value: ['email', 'password'] }
        ]
      });
    }

    return root;
  }
}
