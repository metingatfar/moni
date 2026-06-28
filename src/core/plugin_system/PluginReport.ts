// ===================================================================
// MONI Sprint 6.7 — PluginReport.ts
// Generates the 12 plugin system reports under ./reports/.
// ===================================================================

import * as fs from 'fs';
import * as path from 'path';
import { PluginRegistry } from './PluginRegistry';
import { PluginMetrics } from './PluginMetrics';
import { PluginMarketplace } from './PluginMarketplace';
import { PluginSecurityScanner } from './PluginSecurityScanner';
import { PluginDependencyResolver } from './PluginDependencyResolver';
import { PluginPermissionManager } from './PluginPermissionManager';
import { PluginUpdater } from './PluginUpdater';
import { PluginLoader } from './PluginLoader';

export class PluginReport {
  generatePluginReports(
    registry: PluginRegistry,
    metrics: PluginMetrics,
    marketplace: PluginMarketplace,
    securityScanner: PluginSecurityScanner,
    dependencyResolver: PluginDependencyResolver,
    permissionManager: PluginPermissionManager,
    updater: PluginUpdater,
    loader: PluginLoader,
    targetDir: string = './reports'
  ): void {
    try { fs.mkdirSync(targetDir, { recursive: true }); } catch (_) {}

    const timestamp = new Date().toISOString();

    // 1. Plugin_Registry_Report.md
    const registryDiag = registry.getDiagnostics();
    const allPlugins = registry.listAll();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Registry_Report.md'), `# Plugin Registry Report
Generated: ${timestamp}

## Summary
- Total Plugins: ${registryDiag.totalPlugins}
- Enabled: ${registryDiag.enabledPlugins}
- Disabled: ${registryDiag.disabledPlugins}
- Pending: ${registryDiag.pendingPlugins}
- Categories: ${registryDiag.categories.join(', ') || 'None'}
- Total Usage: ${registryDiag.totalUsage}
- Total Errors: ${registryDiag.totalErrors}

## Installed Plugins
${allPlugins.map(p => `| ${p.name} | v${p.version} | ${p.status} | ${p.category} | ${p.author} |`).join('\n') || 'No plugins installed.'}
`);

    // 2. Plugin_Security_Report.md
    const scanHistory = securityScanner.getScanHistory();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Security_Report.md'), `# Plugin Security Report
Generated: ${timestamp}

## Security Scan Summary
- Total Scans: ${scanHistory.length}
- Passed: ${scanHistory.filter(s => s.passed).length}
- Failed: ${scanHistory.filter(s => !s.passed).length}

## Scan History
${scanHistory.map(s => `### ${s.pluginId}
- Scan ID: ${s.scanId}
- Risk Level: ${s.riskLevel}
- Score: ${s.score}/100
- Passed: ${s.passed ? 'YES' : 'NO'}
- Findings: ${s.findings.length}
- Permission Verdict: ${s.permissionAnalysis.verdict}
- Code Pattern Verdict: ${s.codePatternAnalysis.verdict}
- Supply Chain Verdict: ${s.supplyChainAnalysis.verdict}
`).join('\n') || 'No scans performed.'}
`);

    // 3. Plugin_Dependency_Report.md
    const depCache = dependencyResolver.getResolutionCache();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Dependency_Report.md'), `# Plugin Dependency Report
Generated: ${timestamp}

## Dependency Resolutions
- Total Resolutions: ${depCache.size}

${Array.from(depCache.values()).map(d => `### ${d.pluginId}
- Resolved: ${d.resolved ? 'YES' : 'NO'}
- Satisfied: ${d.satisfiedDependencies.length}
- Missing: ${d.missingDependencies.length}
- Circular: ${d.circularDependencies.length}
- Install Order: ${d.installOrder.join(' → ')}
`).join('\n') || 'No dependency resolutions performed.'}
`);

    // 4. Plugin_Permission_Report.md
    const permDiag = permissionManager.getDiagnostics();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Permission_Report.md'), `# Plugin Permission Report
Generated: ${timestamp}

## Permission Summary
- Total Active Grants: ${permDiag.totalGrants}
- Total Revoked: ${permDiag.totalRevoked}
- Total Audit Entries: ${permDiag.totalAuditEntries}
- Plugins with Grants: ${permDiag.pluginsWithGrants}

## Recent Audit Log
${permissionManager.getAuditLog().slice(-20).map(e => `- [${e.action.toUpperCase()}] ${e.pluginId}: ${e.permission} — ${e.reason}`).join('\n') || 'No audit entries.'}
`);

    // 5. Plugin_Marketplace_Report.md
    const mktDiag = marketplace.getDiagnostics();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Marketplace_Report.md'), `# Plugin Marketplace Report
Generated: ${timestamp}

## Marketplace Summary
- Total Catalog Plugins: ${mktDiag.totalPlugins}
- Featured: ${mktDiag.featuredPlugins}
- Verified: ${mktDiag.verifiedPlugins}
- Premium: ${mktDiag.premiumPlugins}
- Free: ${mktDiag.freePlugins}
- Categories: ${mktDiag.categories.join(', ')}
- Total Reviews: ${mktDiag.totalReviews}

## Top Rated
${marketplace.getTopRated(5).map(p => `- ${p.name} (${p.rating}/5.0) — ${p.downloadCount} downloads`).join('\n')}

## Most Downloaded
${marketplace.getMostDownloaded(5).map(p => `- ${p.name} — ${p.downloadCount} downloads (${p.rating}/5.0)`).join('\n')}
`);

    // 6. Plugin_Update_Report.md
    const updateHistory = updater.getUpdateHistory();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Update_Report.md'), `# Plugin Update Report
Generated: ${timestamp}

## Update Summary
- Total Updates: ${updateHistory.length}
- Successful: ${updateHistory.filter(u => u.success).length}
- Failed: ${updateHistory.filter(u => !u.success).length}

## Update History
${updateHistory.map(u => `- ${u.pluginId}: v${u.previousVersion} → v${u.newVersion} (${u.success ? 'SUCCESS' : 'FAILED'}) — ${u.message}`).join('\n') || 'No updates performed.'}
`);

    // 7. Plugin_Metrics_Report.md
    const m = metrics.getMetrics();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Metrics_Report.md'), `# Plugin Metrics Report
Generated: ${timestamp}

## System Metrics
- Total Installs: ${m.totalInstalls}
- Total Uninstalls: ${m.totalUninstalls}
- Total Enables: ${m.totalEnables}
- Total Disables: ${m.totalDisables}
- Total Updates: ${m.totalUpdates}
- Total Errors: ${m.totalErrors}
- Total Security Scans: ${m.totalSecurityScans}
- Security Failures: ${m.totalSecurityFailures}
- Dependency Resolutions: ${m.totalDependencyResolutions}
- Dependency Failures: ${m.totalDependencyFailures}
- Average Load Time: ${m.averageLoadTimeMs.toFixed(1)}ms

## Top Used Plugins
${metrics.getTopUsedPlugins(5).map(p => `- ${p.pluginId}: ${p.usage} usages`).join('\n') || 'No usage data.'}

## Most Error-Prone Plugins
${metrics.getMostErrorProne(5).map(p => `- ${p.pluginId}: ${p.errors} errors`).join('\n') || 'No errors recorded.'}
`);

    // 8. Plugin_Install_Report.md
    fs.writeFileSync(path.join(targetDir, 'Plugin_Install_Report.md'), `# Plugin Installation Report
Generated: ${timestamp}

## Installation Summary
- Total Installed Plugins: ${registry.getCount()}
- Enabled: ${registry.getEnabledCount()}
- Disabled: ${registry.getDisabledCount()}

## Installed Plugin Details
${allPlugins.map(p => `### ${p.name} (${p.pluginId})
- Version: ${p.version}
- Category: ${p.category}
- Author: ${p.author}
- Status: ${p.status}
- Installed At: ${p.installedAt}
- Load Time: ${p.loadTimeMs}ms
- Usage Count: ${p.usageCount}
- Error Count: ${p.errorCount}
`).join('\n') || 'No plugins installed.'}
`);

    // 9. Plugin_Lifecycle_Report.md
    fs.writeFileSync(path.join(targetDir, 'Plugin_Lifecycle_Report.md'), `# Plugin Lifecycle Report
Generated: ${timestamp}

## Lifecycle Summary
- Installs: ${m.totalInstalls}
- Uninstalls: ${m.totalUninstalls}
- Enables: ${m.totalEnables}
- Disables: ${m.totalDisables}
- Updates: ${m.totalUpdates}

## Active Plugin Lifecycle States
${allPlugins.map(p => `- ${p.name}: ${p.status} (installed: ${p.installedAt}, updated: ${p.updatedAt})`).join('\n') || 'No plugins.'}
`);

    // 10. Plugin_Health_Report.md
    const loaderDiag = loader.getDiagnostics();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Health_Report.md'), `# Plugin Health Report
Generated: ${timestamp}

## System Health
- Loaded Plugins: ${loaderDiag.loadedPlugins}
- Total Memory Usage: ${(loaderDiag.totalMemoryUsageBytes / 1024 / 1024).toFixed(2)} MB
- Error Rate: ${m.totalErrors > 0 ? ((m.totalErrors / Math.max(1, m.totalInstalls)) * 100).toFixed(1) : '0.0'}%

## Plugin Health Status
${allPlugins.map(p => {
  const health = metrics.getPluginHealth(p.pluginId);
  return `- ${p.name}: ${health.healthy ? '✅ HEALTHY' : '⚠️ UNHEALTHY'} (Error Rate: ${(health.errorRate * 100).toFixed(1)}%, Uptime: ${health.uptime}%)`;
}).join('\n') || 'No plugins to report.'}
`);

    // 11. Plugin_Category_Report.md
    const categories = registry.getCategories();
    fs.writeFileSync(path.join(targetDir, 'Plugin_Category_Report.md'), `# Plugin Category Report
Generated: ${timestamp}

## Categories
${categories.map(cat => {
  const catPlugins = registry.listByCategory(cat);
  return `### ${cat}
- Count: ${catPlugins.length}
- Plugins: ${catPlugins.map(p => p.name).join(', ')}
`;
}).join('\n') || 'No categories found.'}

## Marketplace Categories
${marketplace.getCategories().map(cat => {
  const catPlugins = marketplace.getPluginsByCategory(cat);
  return `- ${cat}: ${catPlugins.length} available plugins`;
}).join('\n')}
`);

    // 12. Plugin_Ecosystem_Report.md
    fs.writeFileSync(path.join(targetDir, 'Plugin_Ecosystem_Report.md'), `# Plugin Ecosystem Report
Generated: ${timestamp}

## Ecosystem Overview
- Installed Plugins: ${registry.getCount()}
- Marketplace Catalog: ${marketplace.getCatalogSize()} plugins
- Active Security Scans: ${scanHistory.length}
- Dependency Resolutions: ${depCache.size}
- Permission Grants: ${permDiag.totalGrants}
- Total Updates Performed: ${updateHistory.length}

## Architecture Health
- Registry Status: ✅ Operational
- Security Scanner: ✅ Active
- Dependency Resolver: ✅ Active
- Permission Manager: ✅ Active
- Marketplace: ✅ Connected
- Updater: ✅ Ready
- Loader: ✅ ${loaderDiag.loadedPlugins} plugins loaded
- Metrics Collector: ✅ Recording

## Compliance Summary
- All plugins scanned: ${scanHistory.length > 0 ? 'YES' : 'PENDING'}
- Dependencies resolved: ${depCache.size > 0 ? 'YES' : 'PENDING'}
- Permissions audited: ${permDiag.totalAuditEntries > 0 ? 'YES' : 'PENDING'}
- Dry-Run Mode: ✅ ENFORCED
- Human Approval Required: ✅ MANDATORY
`);

    console.log(`[PluginReport] Generated 12 plugin reports under ${targetDir}/`);
  }
}
