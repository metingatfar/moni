/**
 * SecurityHelper.ts
 * 
 * SECURITY WARNING:
 * This XOR + Base64 masking technique is NOT true production-grade encryption.
 * It is used here exclusively as an MVP local storage obfuscation layer (masking)
 * to prevent plain-text inspection in browser developer tools.
 * 
 * Future Production Migration:
 * This module is designed to be completely modular. In future versions, 
 * this client-side masking will be deprecated in favor of a secure server-side 
 * database connection (e.g. Supabase, Firebase, or PostgreSQL) paired with 
 * standard encryption protocols (AES-256-GCM / Web Crypto API) and proper user session management.
 */
export class SecurityHelper {
  private static SECRET_KEY = 'moni_secure_key_3879';

  /**
   * Obfuscates/encrypts plain text for localStorage storage.
   */
  public static encrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    // Encode to base64 safely handling Unicode characters
    return btoa(unescape(encodeURIComponent(result)));
  }

  /**
   * De-obfuscates/decrypts masked content read from localStorage.
   */
  public static decrypt(cipherText: string): string {
    try {
      if (!cipherText) return '';
      const decoded = decodeURIComponent(escape(atob(cipherText)));
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (e) {
      console.error('SecurityHelper: Decryption/Obfuscation decode error.', e);
      return '';
    }
  }
}
