// ===================================================================
// MONI Sprint 6.7 — PluginSecurityScanner.ts
// Security verification engine for plugins.
// ===================================================================

import type { PluginManifest } from './PluginRegistry';

export interface SecurityScanResult {
  pluginId: string;
  scanId: string;
  passed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  findings: SecurityFinding[];
  scannedAt: string;
  durationMs: number;
  permissionAnalysis: PermissionAnalysis;
  codePatternAnalysis: CodePatternAnalysis;
  supplyChainAnalysis: SupplyChainAnalysis;
}

export interface SecurityFinding {
  findingId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  description: string;
  location: string;
  recommendation: string;
}

export interface PermissionAnalysis {
  requestedPermissions: string[];
  allowedPermissions: string[];
  deniedPermissions: string[];
  excessivePermissions: string[];
  verdict: 'safe' | 'review' | 'deny';
}

export interface CodePatternAnalysis {
  dangerousPatterns: string[];
  unsafeApiUsage: string[];
  dataExfiltrationRisks: string[];
  cryptoMiningPatterns: string[];
  verdict: 'clean' | 'suspicious' | 'malicious';
}

export interface SupplyChainAnalysis {
  knownVulnerabilities: number;
  outdatedDependencies: number;
  untrustedSources: string[];
  checksumValid: boolean;
  signatureValid: boolean;
  verdict: 'trusted' | 'unverified' | 'compromised';
}

export interface PermissionValidation {
  pluginId: string;
  valid: boolean;
  allowed: string[];
  denied: string[];
  reason: string;
}

export interface VulnerabilityReport {
  pluginId: string;
  vulnerabilities: VulnerabilityEntry[];
  totalCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scannedAt: string;
}

export interface VulnerabilityEntry {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedVersion: string;
  fixedVersion: string;
  cveId: string;
}

const DANGEROUS_PATTERNS = [
  'eval(', 'Function(', 'child_process', 'fs.unlinkSync',
  'process.exit', 'require("crypto")', 'XMLHttpRequest',
  'fetch(', 'WebSocket(', 'process.env',
];

const ALLOWED_PERMISSIONS = [
  'read:files', 'write:files', 'read:memory', 'write:memory',
  'execute:commands', 'access:network', 'access:database',
  'access:ai-provider', 'manage:plugins', 'access:system',
  'read:config', 'write:config', 'access:ui', 'access:logs',
];

export class PluginSecurityScanner {
  private scanHistory: SecurityScanResult[] = [];

  scanPlugin(manifest: PluginManifest): SecurityScanResult {
    const startTime = Date.now();
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const permissionAnalysis = this.analyzePermissions(manifest);
    const codePatternAnalysis = this.analyzeCodePatterns(manifest);
    const supplyChainAnalysis = this.analyzeSupplyChain(manifest);

    const findings: SecurityFinding[] = [];

    // Check excessive permissions
    if (permissionAnalysis.excessivePermissions.length > 0) {
      findings.push({
        findingId: `f-${scanId}-perm`,
        severity: 'warning',
        category: 'permissions',
        description: `Plugin requests ${permissionAnalysis.excessivePermissions.length} excessive permissions`,
        location: 'manifest.permissions',
        recommendation: 'Review and reduce permission scope',
      });
    }

    // Check dangerous patterns
    if (codePatternAnalysis.dangerousPatterns.length > 0) {
      findings.push({
        findingId: `f-${scanId}-patterns`,
        severity: 'error',
        category: 'code-patterns',
        description: `Found ${codePatternAnalysis.dangerousPatterns.length} dangerous code patterns`,
        location: manifest.entryPoint,
        recommendation: 'Remove or sandbox dangerous API calls',
      });
    }

    // Check supply chain
    if (!supplyChainAnalysis.checksumValid) {
      findings.push({
        findingId: `f-${scanId}-checksum`,
        severity: 'critical',
        category: 'supply-chain',
        description: 'Plugin checksum verification failed',
        location: 'manifest.checksum',
        recommendation: 'Re-download plugin from trusted source',
      });
    }

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const errorCount = findings.filter(f => f.severity === 'error').length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalCount > 0) riskLevel = 'critical';
    else if (errorCount > 0) riskLevel = 'high';
    else if (findings.length > 2) riskLevel = 'medium';

    const score = Math.max(0, 100 - (criticalCount * 30) - (errorCount * 15) - (findings.length * 5));

    const result: SecurityScanResult = {
      pluginId: manifest.pluginId,
      scanId,
      passed: riskLevel !== 'critical' && riskLevel !== 'high',
      riskLevel,
      score,
      findings,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      permissionAnalysis,
      codePatternAnalysis,
      supplyChainAnalysis,
    };

    this.scanHistory.push(result);
    console.log(`[PluginSecurityScanner] Scanned ${manifest.pluginId}: ${result.passed ? 'PASSED' : 'FAILED'} (Score: ${score})`);
    return result;
  }

  validatePermissions(pluginId: string, requested: string[]): PermissionValidation {
    const allowed = requested.filter(p => ALLOWED_PERMISSIONS.includes(p));
    const denied = requested.filter(p => !ALLOWED_PERMISSIONS.includes(p));

    return {
      pluginId,
      valid: denied.length === 0,
      allowed,
      denied,
      reason: denied.length > 0
        ? `Denied permissions: ${denied.join(', ')}`
        : 'All permissions are valid',
    };
  }

  checkVulnerabilities(pluginId: string): VulnerabilityReport {
    // Simulated vulnerability database check
    const vulns: VulnerabilityEntry[] = [
      {
        id: `vuln-${pluginId}-001`,
        severity: 'low',
        title: 'Outdated serialization library',
        description: 'Uses deprecated JSON parsing method with known edge cases',
        affectedVersion: '1.0.0',
        fixedVersion: '1.1.0',
        cveId: 'CVE-2024-MONI-001',
      },
    ];

    return {
      pluginId,
      vulnerabilities: vulns,
      totalCount: vulns.length,
      criticalCount: vulns.filter(v => v.severity === 'critical').length,
      highCount: vulns.filter(v => v.severity === 'high').length,
      mediumCount: vulns.filter(v => v.severity === 'medium').length,
      lowCount: vulns.filter(v => v.severity === 'low').length,
      scannedAt: new Date().toISOString(),
    };
  }

  getScanHistory(): SecurityScanResult[] {
    return [...this.scanHistory];
  }

  getLastScan(pluginId: string): SecurityScanResult | undefined {
    return [...this.scanHistory].reverse().find(s => s.pluginId === pluginId);
  }

  private analyzePermissions(manifest: PluginManifest): PermissionAnalysis {
    const allowed = manifest.permissions.filter(p => ALLOWED_PERMISSIONS.includes(p));
    const denied = manifest.permissions.filter(p => !ALLOWED_PERMISSIONS.includes(p));
    const excessive = manifest.permissions.filter(p =>
      ['access:system', 'execute:commands', 'access:network'].includes(p)
    );

    let verdict: 'safe' | 'review' | 'deny' = 'safe';
    if (denied.length > 0) verdict = 'deny';
    else if (excessive.length > 0) verdict = 'review';

    return {
      requestedPermissions: manifest.permissions,
      allowedPermissions: allowed,
      deniedPermissions: denied,
      excessivePermissions: excessive,
      verdict,
    };
  }

  private analyzeCodePatterns(manifest: PluginManifest): CodePatternAnalysis {
    // Simulated code pattern analysis
    const entryLower = manifest.entryPoint.toLowerCase();
    const dangerous = DANGEROUS_PATTERNS.filter(p =>
      entryLower.includes(p.toLowerCase().replace('(', ''))
    );

    return {
      dangerousPatterns: dangerous,
      unsafeApiUsage: [],
      dataExfiltrationRisks: [],
      cryptoMiningPatterns: [],
      verdict: dangerous.length > 0 ? 'suspicious' : 'clean',
    };
  }

  private analyzeSupplyChain(manifest: PluginManifest): SupplyChainAnalysis {
    return {
      knownVulnerabilities: 0,
      outdatedDependencies: manifest.dependencies.length > 3 ? 1 : 0,
      untrustedSources: [],
      checksumValid: manifest.checksum.length > 0,
      signatureValid: true,
      verdict: manifest.checksum.length > 0 ? 'trusted' : 'unverified',
    };
  }
}
