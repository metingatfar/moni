import type { NativeBridgeRepository } from '../../domain/repositories/NativeBridgeRepository';

// Define the interface for possible native bridge window objects
interface CustomWindow extends Window {
  ReactNativeWebView?: {
    postMessage(message: string): void;
  };
  FlutterBridge?: {
    postMessage(message: string): void;
  };
}

declare const window: CustomWindow;

export class NativeBridge implements NativeBridgeRepository {
  async makePhoneCall(phoneNumber: string): Promise<boolean> {
    console.log(`NativeBridge: Initiating phone call to ${phoneNumber}`);

    // 1. Check React Native WebView Bridge
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'dial', phoneNumber }));
      return true;
    }

    // 2. Check Flutter Bridge
    if (window.FlutterBridge) {
      window.FlutterBridge.postMessage(JSON.stringify({ action: 'dial', phoneNumber }));
      return true;
    }

    // 3. Fallback to Web standard URL scheme
    window.open(`tel:${phoneNumber}`, '_self');
    return true;
  }

  async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`NativeBridge: Sending WhatsApp message to ${phoneNumber}`);
    const encodedText = encodeURIComponent(message);
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');

    // 1. Check Native Bridges
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'whatsapp', phoneNumber: cleanedPhone, message }));
      return true;
    }

    // 2. Fallback to Web WhatsApp API
    window.open(`https://wa.me/${cleanedPhone}?text=${encodedText}`, '_blank');
    return true;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`NativeBridge: Drafting email to ${to}`);
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 1. Check Native Bridges
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'email', to, subject, body }));
      return true;
    }

    // 2. Fallback to Web standard mailto
    window.open(mailtoUrl, '_self');
    return true;
  }
}
