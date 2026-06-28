export type UserRole =
  | 'Administrator'
  | 'Project Manager'
  | 'Software Architect'
  | 'Developer'
  | 'UI Designer'
  | 'Tester'
  | 'Reviewer'
  | 'Customer'
  | 'Guest';

export type PermissionType =
  | 'Read'
  | 'Write'
  | 'Execute'
  | 'Configure'
  | 'Approve'
  | 'Export'
  | 'Install Plugins'
  | 'Manage AI Providers';

export class PermissionManager {
  private activeRole: UserRole = 'Developer';

  private rolePermissions: Map<UserRole, Set<PermissionType>> = new Map();

  constructor() {
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions(): void {
    // Guest gets Read access only
    this.rolePermissions.set('Guest', new Set(['Read']));

    // Developer gets Read, Write, Execute
    this.rolePermissions.set('Developer', new Set(['Read', 'Write', 'Execute']));

    // Architect gets Read, Write, Execute, Configure, Export
    this.rolePermissions.set('Software Architect', new Set(['Read', 'Write', 'Execute', 'Configure', 'Export']));

    // Reviewer gets Read, Approve
    this.rolePermissions.set('Reviewer', new Set(['Read', 'Approve']));

    // Administrator gets all permissions
    this.rolePermissions.set(
      'Administrator',
      new Set([
        'Read',
        'Write',
        'Execute',
        'Configure',
        'Approve',
        'Export',
        'Install Plugins',
        'Manage AI Providers'
      ])
    );
  }

  public setRole(role: UserRole): void {
    this.activeRole = role;
  }

  public getRole(): UserRole {
    return this.activeRole;
  }

  public hasPermission(permission: PermissionType): boolean {
    const perms = this.rolePermissions.get(this.activeRole);
    return perms ? perms.has(permission) : false;
  }

  public checkAccess(permission: PermissionType): { authorized: boolean; error?: string } {
    if (this.hasPermission(permission)) {
      return { authorized: true };
    }
    return {
      authorized: false,
      error: `Access Denied: Current role '${this.activeRole}' lacks required permission '${permission}'`
    };
  }

  public getPermissions(): PermissionType[] {
    const perms = this.rolePermissions.get(this.activeRole);
    return perms ? Array.from(perms) : [];
  }
}

export const permissionManagerOS = new PermissionManager();
export default permissionManagerOS;
