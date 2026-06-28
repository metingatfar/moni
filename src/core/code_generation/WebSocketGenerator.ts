export class WebSocketGenerator {
  public generateWebSocketHandler(event: string): string {
    return `ws.on('connection', (socket) => {\n  socket.on('${event}', (data) => {\n    socket.emit('${event}_ack', { status: 'ok' });\n  });\n});\n`;
  }
}
