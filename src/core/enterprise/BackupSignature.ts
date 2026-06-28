import crypto from 'crypto';

export class BackupSignature {
  public generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  public signPayload(payload: string): string {
    // Mimic RSA/HMAC signature locally
    return crypto.createHmac('sha256', 'signature-secret-key')
                 .update(payload)
                 .digest('hex');
  }

  public verifySignature(payload: string, signature: string): boolean {
    const computed = this.signPayload(payload);
    return computed === signature;
  }
}
export const backupSignature = new BackupSignature();
export default backupSignature;
