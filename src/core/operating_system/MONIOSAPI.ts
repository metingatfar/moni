export interface ClientConnection {
  clientId: string;
  clientType: 'VSCode' | 'Cursor' | 'Windsurf' | 'WebDashboard' | 'Mobile';
  connectedAt: number;
}

export class MONIOSAPI {
  private activeClients: Map<string, ClientConnection> = new Map();
  private status: 'active' | 'inactive' = 'active';

  constructor() {
    this.initializeDefaultConnections();
  }

  private initializeDefaultConnections(): void {
    this.activeClients.set('client-vs-1', {
      clientId: 'client-vs-1',
      clientType: 'VSCode',
      connectedAt: Date.now() - 3600000
    });
    this.activeClients.set('client-web-1', {
      clientId: 'client-web-1',
      clientType: 'WebDashboard',
      connectedAt: Date.now() - 1200000
    });
  }

  public registerClient(id: string, type: ClientConnection['clientType']): void {
    this.activeClients.set(id, {
      clientId: id,
      clientType: type,
      connectedAt: Date.now()
    });
  }

  public removeClient(id: string): void {
    this.activeClients.delete(id);
  }

  public getClients(): ClientConnection[] {
    return Array.from(this.activeClients.values());
  }

  public getEndpoints(): string[] {
    return [
      'GET /api/v1/os/health',
      'GET /api/v1/os/engines',
      'POST /api/v1/os/workflow',
      'WS /api/v1/os/events',
      'MCP /mcp/listTools'
    ];
  }

  public getStatus(): 'active' | 'inactive' {
    return this.status;
  }

  public toggleApi(active: boolean): void {
    this.status = active ? 'active' : 'inactive';
  }
}

export const moniOSAPI = new MONIOSAPI();
export default moniOSAPI;
