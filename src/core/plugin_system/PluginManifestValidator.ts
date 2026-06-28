// ===================================================================
// MONI Sprint 6.7 Enterprise Addendum — PluginManifestValidator.ts
// Deep validation of plugin.json manifests before installation.
// ===================================================================

export interface ManifestValidationResult {
  pluginId: string;
  valid: boolean;
  score: number;
  errors: ManifestError[];
  warnings: ManifestWarning[];
  compatibility: CompatibilityCheck;
  apiValidation: ApiValidation;
  versionValidation: VersionCheck;
  validatedAt: string;
}

export interface ManifestError {
  code: string;
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ManifestWarning {
  code: string;
  field: string;
  message: string;
}

export interface CompatibilityCheck {
  compatible: boolean;
  moniVersion: string;
  requiredMinVersion: string;
  requiredMaxVersion?: string;
  platform: string;
  supportedPlatforms: string[];
}

export interface ApiValidation {
  valid: boolean;
  requiredApis: string[];
  availableApis: string[];
  missingApis: string[];
}

export interface VersionCheck {
  valid: boolean;
  format: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
}

const VALID_CATEGORIES = [
  'ai-provider', 'database', 'cloud-platform', 'ide-integration', 'deployment',
  'developer-utility', 'enterprise-extension', 'security', 'monitoring', 'testing',
  'documentation', 'communication', 'analytics', 'storage', 'custom',
];

const VALID_PERMISSIONS = [
  'read:files', 'write:files', 'read:memory', 'write:memory',
  'execute:commands', 'access:network', 'access:database',
  'access:ai-provider', 'manage:plugins', 'access:system',
  'read:config', 'write:config', 'access:ui', 'access:logs',
];

const AVAILABLE_APIS = [
  'moni.files', 'moni.memory', 'moni.config', 'moni.ui', 'moni.network',
  'moni.database', 'moni.ai', 'moni.plugins', 'moni.system', 'moni.logs',
  'moni.events', 'moni.workflow', 'moni.agent', 'moni.brain', 'moni.execution',
];

const CURRENT_MONI_VERSION = '6.7.0';

export class PluginManifestValidator {
  private validationHistory: ManifestValidationResult[] = [];

  validate(manifest: any): ManifestValidationResult {
    const errors: ManifestError[] = [];
    const warnings: ManifestWarning[] = [];

    // ---- Required Fields ----
    if (!manifest.pluginId || typeof manifest.pluginId !== 'string') {
      errors.push({ code: 'MV-E001', field: 'pluginId', message: 'pluginId is required and must be a string', severity: 'critical' });
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(manifest.pluginId) && manifest.pluginId.length > 2) {
      errors.push({ code: 'MV-E002', field: 'pluginId', message: 'pluginId must be lowercase alphanumeric with hyphens', severity: 'error' });
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push({ code: 'MV-E003', field: 'name', message: 'name is required', severity: 'critical' });
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push({ code: 'MV-E004', field: 'version', message: 'version is required', severity: 'critical' });
    }

    if (!manifest.entryPoint || typeof manifest.entryPoint !== 'string') {
      errors.push({ code: 'MV-E005', field: 'entryPoint', message: 'entryPoint is required', severity: 'critical' });
    }

    if (!manifest.author || typeof manifest.author !== 'string') {
      errors.push({ code: 'MV-E006', field: 'author', message: 'author is required', severity: 'error' });
    }

    // ---- Category ----
    if (manifest.category && !VALID_CATEGORIES.includes(manifest.category)) {
      errors.push({ code: 'MV-E007', field: 'category', message: `Invalid category: ${manifest.category}. Valid: ${VALID_CATEGORIES.join(', ')}`, severity: 'error' });
    }

    // ---- Permissions ----
    if (manifest.permissions && Array.isArray(manifest.permissions)) {
      for (const perm of manifest.permissions) {
        if (!VALID_PERMISSIONS.includes(perm)) {
          errors.push({ code: 'MV-E008', field: 'permissions', message: `Invalid permission: ${perm}`, severity: 'error' });
        }
      }
    }

    // ---- Dependencies ----
    if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
      for (const dep of manifest.dependencies) {
        if (!dep.pluginId) errors.push({ code: 'MV-E009', field: 'dependencies', message: 'Dependency missing pluginId', severity: 'error' });
        if (!dep.minVersion) errors.push({ code: 'MV-E010', field: 'dependencies', message: `Dependency ${dep.pluginId || 'unknown'} missing minVersion`, severity: 'error' });
      }
    }

    // ---- Warnings ----
    if (!manifest.description) warnings.push({ code: 'MV-W001', field: 'description', message: 'Description improves discoverability' });
    if (!manifest.license) warnings.push({ code: 'MV-W002', field: 'license', message: 'License is recommended' });
    if (!manifest.tags || manifest.tags.length === 0) warnings.push({ code: 'MV-W003', field: 'tags', message: 'Tags improve search results' });
    if (!manifest.homepage) warnings.push({ code: 'MV-W004', field: 'homepage', message: 'Homepage URL is recommended' });
    if (!manifest.minMoniVersion) warnings.push({ code: 'MV-W005', field: 'minMoniVersion', message: 'Minimum MONI version should be specified' });
    if (manifest.size !== undefined && manifest.size <= 0) warnings.push({ code: 'MV-W006', field: 'size', message: 'Plugin size should be positive' });

    // ---- Version validation ----
    const versionValidation = this.validateVersion(manifest.version);

    // ---- Compatibility check ----
    const compatibility = this.checkCompatibility(manifest);

    // ---- API validation ----
    const apiValidation = this.validateApis(manifest.requiredApis || []);

    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const score = Math.max(0, 100 - (criticalCount * 25) - (errors.length * 8) - (warnings.length * 2));

    const result: ManifestValidationResult = {
      pluginId: manifest.pluginId || 'unknown',
      valid: criticalCount === 0,
      score,
      errors,
      warnings,
      compatibility,
      apiValidation,
      versionValidation,
      validatedAt: new Date().toISOString(),
    };

    this.validationHistory.push(result);
    console.log(`[PluginManifestValidator] Validated ${manifest.pluginId || 'unknown'}: ${result.valid ? 'VALID' : 'INVALID'} (Score: ${score})`);
    return result;
  }

  getValidationHistory(): ManifestValidationResult[] {
    return [...this.validationHistory];
  }

  getValidCount(): number {
    return this.validationHistory.filter(v => v.valid).length;
  }

  getInvalidCount(): number {
    return this.validationHistory.filter(v => !v.valid).length;
  }

  getDiagnostics(): any {
    return {
      totalValidations: this.validationHistory.length,
      validCount: this.getValidCount(),
      invalidCount: this.getInvalidCount(),
      averageScore: this.validationHistory.length > 0
        ? this.validationHistory.reduce((s, v) => s + v.score, 0) / this.validationHistory.length
        : 0,
    };
  }

  private validateVersion(version: string | undefined): VersionCheck {
    if (!version) return { valid: false, format: 'missing', major: 0, minor: 0, patch: 0 };

    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-(.+))?$/);
    if (!match) return { valid: false, format: version, major: 0, minor: 0, patch: 0 };

    return {
      valid: true,
      format: 'semver',
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      preRelease: match[5],
    };
  }

  private checkCompatibility(manifest: any): CompatibilityCheck {
    const minVersion = manifest.minMoniVersion || '1.0.0';
    const currentParts = CURRENT_MONI_VERSION.split('.').map(Number);
    const minParts = minVersion.split('.').map(Number);

    let compatible = true;
    for (let i = 0; i < 3; i++) {
      if ((currentParts[i] || 0) < (minParts[i] || 0)) { compatible = false; break; }
      if ((currentParts[i] || 0) > (minParts[i] || 0)) break;
    }

    return {
      compatible,
      moniVersion: CURRENT_MONI_VERSION,
      requiredMinVersion: minVersion,
      requiredMaxVersion: manifest.maxMoniVersion,
      platform: 'universal',
      supportedPlatforms: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
    };
  }

  private validateApis(requiredApis: string[]): ApiValidation {
    const missing = requiredApis.filter(api => !AVAILABLE_APIS.includes(api));
    return {
      valid: missing.length === 0,
      requiredApis,
      availableApis: AVAILABLE_APIS,
      missingApis: missing,
    };
  }
}
