// ===================================================================
// MONI Sprint 6.7 Enterprise Addendum — PluginGateway.ts
// All plugin-to-plugin communication must pass through this gateway.
// ===================================================================

export interface GatewayMessage {
  messageId: string;
  sourcePluginId: string;
  targetPluginId: string;
  action: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'delivered' | 'rejected' | 'timeout' | 'error';
  responsePayload?: any;
  responseTimestamp?: string;
  durationMs?: number;
}

export interface GatewayRoute {
  routeId: string;
  sourcePattern: string;
  targetPluginId: string;
  action: string;
  enabled: boolean;
  createdAt: string;
  requestCount: number;
}

export interface GatewaySecurityEvent {
  eventId: string;
  type: 'unauthorized' | 'rate-limit' | 'blocked' | 'suspicious' | 'injection';
  sourcePluginId: string;
  targetPluginId: string;
  action: string;
  timestamp: string;
  details: string;
  blocked: boolean;
}

export interface GatewayStats {
  totalRequests: number;
  deliveredRequests: number;
  rejectedRequests: number;
  timeoutRequests: number;
  errorRequests: number;
  averageLatencyMs: number;
  securityEvents: number;
  activeRoutes: number;
}

export class PluginGateway {
  private messages: GatewayMessage[] = [];
  private routes: Map<string, GatewayRoute> = new Map();
  private securityEvents: GatewaySecurityEvent[] = [];
  private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  private totalRequests = 0;
  private deliveredCount = 0;
  private rejectedCount = 0;
  private timeoutCount = 0;
  private errorCount = 0;
  private totalLatencyMs = 0;

  sendMessage(sourcePluginId: string, targetPluginId: string, action: string, payload: any = {}): GatewayMessage {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.totalRequests++;

    // Rate limiting check
    if (this.isRateLimited(sourcePluginId)) {
      this.rejectedCount++;
      this.recordSecurityEvent('rate-limit', sourcePluginId, targetPluginId, action, 'Rate limit exceeded', true);
      const msg: GatewayMessage = {
        messageId, sourcePluginId, targetPluginId, action, payload,
        timestamp: new Date().toISOString(), status: 'rejected',
      };
      this.messages.push(msg);
      console.log(`[PluginGateway] REJECTED (rate-limit): ${sourcePluginId} → ${targetPluginId}:${action}`);
      return msg;
    }

    // Security validation
    if (sourcePluginId === targetPluginId) {
      this.recordSecurityEvent('suspicious', sourcePluginId, targetPluginId, action, 'Self-referencing message', false);
    }

    // Route the message (dry-run simulation)
    const simulatedLatency = Math.floor(Math.random() * 20) + 1;

    const msg: GatewayMessage = {
      messageId,
      sourcePluginId,
      targetPluginId,
      action,
      payload,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      responsePayload: { success: true, message: `Action ${action} processed by ${targetPluginId}` },
      responseTimestamp: new Date().toISOString(),
      durationMs: simulatedLatency,
    };

    this.messages.push(msg);
    this.deliveredCount++;
    this.totalLatencyMs += simulatedLatency;
    this.incrementRateCounter(sourcePluginId);

    // Update route stats
    const routeKey = `${sourcePluginId}→${targetPluginId}:${action}`;
    if (!this.routes.has(routeKey)) {
      this.routes.set(routeKey, {
        routeId: `route-${Date.now()}`,
        sourcePattern: sourcePluginId,
        targetPluginId,
        action,
        enabled: true,
        createdAt: new Date().toISOString(),
        requestCount: 0,
      });
    }
    this.routes.get(routeKey)!.requestCount++;

    console.log(`[PluginGateway] ${sourcePluginId} → ${targetPluginId}:${action} (${simulatedLatency}ms)`);
    return msg;
  }

  broadcastMessage(sourcePluginId: string, action: string, payload: any, targetPluginIds: string[]): GatewayMessage[] {
    return targetPluginIds.map(target => this.sendMessage(sourcePluginId, target, action, payload));
  }

  getMessageHistory(): GatewayMessage[] {
    return [...this.messages];
  }

  getMessagesByPlugin(pluginId: string): GatewayMessage[] {
    return this.messages.filter(m => m.sourcePluginId === pluginId || m.targetPluginId === pluginId);
  }

  getRoutes(): GatewayRoute[] {
    return Array.from(this.routes.values());
  }

  getActiveRoutes(): GatewayRoute[] {
    return this.getRoutes().filter(r => r.enabled);
  }

  disableRoute(routeKey: string): void {
    const route = this.routes.get(routeKey);
    if (route) {
      route.enabled = false;
      console.log(`[PluginGateway] Disabled route: ${routeKey}`);
    }
  }

  getSecurityEvents(): GatewaySecurityEvent[] {
    return [...this.securityEvents];
  }

  getStats(): GatewayStats {
    return {
      totalRequests: this.totalRequests,
      deliveredRequests: this.deliveredCount,
      rejectedRequests: this.rejectedCount,
      timeoutRequests: this.timeoutCount,
      errorRequests: this.errorCount,
      averageLatencyMs: this.deliveredCount > 0 ? this.totalLatencyMs / this.deliveredCount : 0,
      securityEvents: this.securityEvents.length,
      activeRoutes: this.getActiveRoutes().length,
    };
  }

  getDiagnostics(): any {
    const stats = this.getStats();
    return {
      ...stats,
      messagesInHistory: this.messages.length,
      totalRoutes: this.routes.size,
    };
  }

  private isRateLimited(pluginId: string): boolean {
    const limit = this.rateLimits.get(pluginId);
    if (!limit) return false;
    if (Date.now() > limit.resetAt) {
      this.rateLimits.delete(pluginId);
      return false;
    }
    return limit.count > 100; // 100 requests per window
  }

  private incrementRateCounter(pluginId: string): void {
    if (!this.rateLimits.has(pluginId)) {
      this.rateLimits.set(pluginId, { count: 0, resetAt: Date.now() + 60000 });
    }
    this.rateLimits.get(pluginId)!.count++;
  }

  private recordSecurityEvent(
    type: GatewaySecurityEvent['type'], source: string, target: string,
    action: string, details: string, blocked: boolean
  ): void {
    this.securityEvents.push({
      eventId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type, sourcePluginId: source, targetPluginId: target,
      action, timestamp: new Date().toISOString(), details, blocked,
    });
  }
}
