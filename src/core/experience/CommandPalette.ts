export interface PaletteCommand {
  id: string;
  name: string;
  category: string;
  action: () => void;
}

export class CommandPalette {
  private commands: PaletteCommand[] = [];

  public register(name: string, category: string, action: () => void): void {
    this.commands.push({
      id: 'cmd-' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      action
    });
  }

  public query(term: string): PaletteCommand[] {
    const lower = term.toLowerCase();
    return this.commands.filter(
      c => c.name.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
  }

  public executeCommand(id: string): void {
    const cmd = this.commands.find(c => c.id === id);
    if (cmd) {
      cmd.action();
    }
  }
}
export const commandPalette = new CommandPalette();
export default commandPalette;
