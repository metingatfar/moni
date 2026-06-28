import crypto from 'crypto';

export class BackupEncryption {
  private algorithm = 'aes-256-cbc';
  
  // Resolve key dynamically; do not hardcode.
  private getEncryptionKey(): Buffer {
    const secret = process.env.MONI_BACKUP_KEY || 'moni-default-enterprise-passphrase-32';
    // Derives a 32-byte key from the secret
    return crypto.scryptSync(secret, 'moni-salt', 32);
  }

  public encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Package IV with payload
    return iv.toString('hex') + ':' + encrypted;
  }

  public decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted package format.');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = this.getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
export const backupEncryption = new BackupEncryption();
export default backupEncryption;
