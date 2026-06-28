export class AdminPanelPlanner {
  public planAdminPanel(userInput: string): { enabled: boolean; pages: string[]; actions: string[] } {
    const lower = userInput.toLowerCase();
    const enabled = lower.includes('admin') || lower.includes('erp') || lower.includes('enterprise') || lower.includes('dashboard') || true; // standard default

    const pages = [
      'UserManagementDashboard',
      'SystemHealthMonitor',
      'AuditLogsViewer',
      'GlobalConfigurationsSettings'
    ];

    const actions = [
      'ban_user',
      'modify_role',
      'clear_cache',
      'export_audit_trail',
      'trigger_backup'
    ];

    return {
      enabled,
      pages,
      actions
    };
  }
}
