import { backupEncryption } from '../../src/core/enterprise/BackupEncryption.ts';

const plaintext = JSON.stringify({ test: "data", secrets: "hidden" });
console.log('Plaintext:', plaintext);
const encrypted = backupEncryption.encrypt(plaintext);
console.log('Encrypted:', encrypted);
const decrypted = backupEncryption.decrypt(encrypted);
console.log('Decrypted:', decrypted);
if (plaintext === decrypted) {
  console.log('Backup Encryption/Decryption test passed successfully.');
} else {
  console.error('Backup Encryption/Decryption test failed.');
  process.exit(1);
}
