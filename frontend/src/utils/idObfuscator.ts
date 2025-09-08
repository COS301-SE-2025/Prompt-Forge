/**
 * Simple ID obfuscation utility
 */
export class IdObfuscator {
  /**
   * Hide a UUID by encoding it
   */
  static hide(id: string): string {
    return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Reveal the original UUID by decoding it
   */
  static reveal(hiddenId: string): string {
    // Add padding back
    let padded = hiddenId.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) {
      padded += '=';
    }
    return atob(padded);
  }
}

export default IdObfuscator;
