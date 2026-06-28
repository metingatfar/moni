export interface MoniNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'security' | 'ai_suggestions';
  message: string;
  timestamp: number;
}

export class NotificationCenter {
  private log: MoniNotification[] = [];

  public publish(type: MoniNotification['type'], message: string): void {
    const notif: MoniNotification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now()
    };
    this.log.push(notif);
  }

  public getNotifications(type?: MoniNotification['type']): MoniNotification[] {
    if (type) {
      return this.log.filter(n => n.type === type);
    }
    return this.log;
  }
}
export const notificationCenter = new NotificationCenter();
export default notificationCenter;
