export interface NativeBridgeRepository {
  /**
   * Triggers native phone call dialer
   */
  makePhoneCall(phoneNumber: string): Promise<boolean>;

  /**
   * Opens native or web WhatsApp application with pre-filled contact and message
   */
  sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean>;

  /**
   * Triggers native email composer with draft contents
   */
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
