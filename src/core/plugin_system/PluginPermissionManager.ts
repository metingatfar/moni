// ===================================================================
// MONI Sprint 6.7 — PluginPermissionManager.ts
// Manages plugin permission grants, revocations, and access control.
// ===================================================================

export interface PermissionGrant {
  pluginId: string;
  permission: string;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
  revoked: boolean;
  revokedAt?: string;
}

export interface PermissionAuditEntry {
  pluginId: string;
  permission: string;
  action: 'granted' | 'revoked' | 'checked' | 'denied';
  timestamp: string;
  reason: string;
}

export class PluginPermissionManager {
  private grants: Map<string, PermissionGrant[]> = new Map();
  private auditLog: PermissionAuditEntry[] = [];

  grantPermission(pluginId: string, permission: string, grantedBy: string = 'system'): void {
    if (!this.grants.has(pluginId)) {
      this.grants.set(pluginId, []);
    }

    const existing = this.grants.get(pluginId)!.find(g => g.permission === permission && !g.revoked);
    if (existing) {
      console.log(`[PluginPermissionManager] Permission ${permission} already granted to ${pluginId}`);
      return;
    }

    const grant: PermissionGrant = {
      pluginId,
      permission,
      grantedAt: new Date().toISOString(),
      grantedBy,
      revoked: false,
    };

    this.grants.get(pluginId)!.push(grant);
    this.auditLog.push({
      pluginId,
      permission,
      action: 'granted',
      timestamp: new Date().toISOString(),
      reason: `Permission ${permission} granted by ${grantedBy}`,
    });

    console.log(`[PluginPermissionManager] Granted ${permission} to ${pluginId}`);
  }

  revokePermission(pluginId: string, permission: string): void {
    const pluginGrants = this.grants.get(pluginId);
    if (!pluginGrants) return;

    const grant = pluginGrants.find(g => g.permission === permission && !g.revoked);
    if (grant) {
      grant.revoked = true;
      grant.revokedAt = new Date().toISOString();

      this.auditLog.push({
        pluginId,
        permission,
        action: 'revoked',
        timestamp: new Date().toISOString(),
        reason: `Permission ${permission} revoked`,
      });

      console.log(`[PluginPermissionManager] Revoked ${permission} from ${pluginId}`);
    }
  }

  checkPermission(pluginId: string, permission: string): boolean {
    const pluginGrants = this.grants.get(pluginId);
    if (!pluginGrants) {
      this.auditLog.push({
        pluginId,
        permission,
        action: 'denied',
        timestamp: new Date().toISOString(),
        reason: 'No grants found for plugin',
      });
      return false;
    }

    const granted = pluginGrants.some(g => g.permission === permission && !g.revoked);

    this.auditLog.push({
      pluginId,
      permission,
      action: granted ? 'checked' : 'denied',
      timestamp: new Date().toISOString(),
      reason: granted ? 'Permission verified' : 'Permission not granted',
    });

    return granted;
  }

  getPluginPermissions(pluginId: string): string[] {
    const pluginGrants = this.grants.get(pluginId);
    if (!pluginGrants) return [];
    return pluginGrants.filter(g => !g.revoked).map(g => g.permission);
  }

  getAllGrants(pluginId: string): PermissionGrant[] {
    return this.grants.get(pluginId) || [];
  }

  revokeAllPermissions(pluginId: string): void {
    const pluginGrants = this.grants.get(pluginId);
    if (!pluginGrants) return;

    pluginGrants.forEach(g => {
      if (!g.revoked) {
        g.revoked = true;
        g.revokedAt = new Date().toISOString();
      }
    });

    this.auditLog.push({
      pluginId,
      permission: '*',
      action: 'revoked',
      timestamp: new Date().toISOString(),
      reason: 'All permissions revoked',
    });

    console.log(`[PluginPermissionManager] Revoked all permissions from ${pluginId}`);
  }

  getAuditLog(): PermissionAuditEntry[] {
    return [...this.auditLog];
  }

  getAuditLogForPlugin(pluginId: string): PermissionAuditEntry[] {
    return this.auditLog.filter(e => e.pluginId === pluginId);
  }

  getDiagnostics(): any {
    const allGrants = Array.from(this.grants.values()).flat();
    return {
      totalGrants: allGrants.filter(g => !g.revoked).length,
      totalRevoked: allGrants.filter(g => g.revoked).length,
      totalAuditEntries: this.auditLog.length,
      pluginsWithGrants: this.grants.size,
    };
  }
}
