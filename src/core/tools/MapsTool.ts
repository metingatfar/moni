import type { Tool } from './ToolManager';

export class MapsTool implements Tool {
  name = 'maps';
  description = 'Yol durumu, harita ve konum arama işlemlerini yönetir.';

  async execute(args: { destination: string }): Promise<any> {
    console.log('[MapsTool] Routing to:', args.destination);
    return { routeFound: true, estimatedTime: '45 dk' };
  }
}
