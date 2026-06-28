import { projectFingerprint } from '../../src/core/enterprise/ProjectFingerprint.ts';

const hash = projectFingerprint.generateFingerprint();
console.log('--- MONI Project Secure Fingerprint ---');
console.log(`Fingerprint: ${hash}`);
console.log('Verify matching fingerprint?', projectFingerprint.verifyFingerprint(hash));
