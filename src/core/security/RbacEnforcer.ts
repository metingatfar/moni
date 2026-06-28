// ===================================================================
// MONI Sprint 6.8 — RbacEnforcer.ts
// Role-Based Access Control simulator.
// ===================================================================

export type Role = 'Guest' | 'Developer' | 'DevOps' | 'SecurityAdmin' | 'System';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'execute' | 'delete' | 'approve';
}

export interface AccessRequest {
  user: string;
  role: Role;
  permission: Permission;
}

export interface RbacAuditLog {
  timestamp: string;
  request: AccessRequest;
  granted: boolean;
  reason: string;
}

export class RbacEnforcer {
  private rolePermissions: Map<Role, Permission[]> = new Map();
  private auditLogs: RbacAuditLog[] = [];

  constructor() {
    this.initializeRoles();
  }

  private initializeRoles() {
    this.rolePermissions.set('Guest', [
      { resource: 'dashboard', action: 'read' }
    ]);
    this.rolePermissions.set('Developer', [
      { resource: 'dashboard', action: 'read' },
      { resource: 'code', action: 'read' },
      { resource: 'code', action: 'write' },
      { resource: 'plugin', action: 'read' }
    ]);
    this.rolePermissions.set('DevOps', [
      { resource: 'dashboard', action: 'read' },
      { resource: 'deployment', action: 'execute' },
      { resource: 'plugin', action: 'write' },
      { resource: 'plugin', action: 'execute' }
    ]);
    this.rolePermissions.set('SecurityAdmin', [
      { resource: 'dashboard', action: 'read' },
      { resource: 'policy', action: 'read' },
      { resource: 'policy', action: 'write' },
      { resource: 'vault', action: 'read' },
      { resource: 'workflow', action: 'approve' }
    ]);
    this.rolePermissions.set('System', [
      { resource: '*', action: 'read' },
      { resource: '*', action: 'write' },
      { resource: '*', action: 'execute' },
      { resource: '*', action: 'delete' },
      { resource: '*', action: 'approve' }
    ]);
  }

  checkAccess(request: AccessRequest): boolean {
    const permissions = this.rolePermissions.get(request.role) || [];
    
    let granted = false;
    for (const perm of permissions) {
      if ((perm.resource === '*' || perm.resource === request.permission.resource) &&
          (perm.action === request.permission.action)) {
        granted = true;
        break;
      }
    }

    this.auditLogs.push({
      timestamp: new Date().toISOString(),
      request,
      granted,
      reason: granted ? 'Role has required permission' : 'Role lacks required permission'
    });

    return granted;
  }

  getAuditLogs(): RbacAuditLog[] {
    return [...this.auditLogs];
  }

  getMetrics(): any {
    const total = this.auditLogs.length;
    const denied = this.auditLogs.filter(l => !l.granted).length;
    
    return {
      totalChecks: total,
      deniedAccessCount: denied,
      activeRoles: this.rolePermissions.size
    };
  }
}
