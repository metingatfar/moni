import type { Tool } from './ToolManager';

export class WeatherTool implements Tool {
  name = 'weather';
  description = 'Hava durumu bilgilerini sorgular.';

  async execute(args: { city: string }): Promise<any> {
    console.log('[WeatherTool] Querying weather for:', args.city);
    return { city: args.city, temp: '25°C', condition: 'Güneşli' };
  }
}
