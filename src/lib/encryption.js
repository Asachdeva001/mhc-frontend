/**
 * End-to-End Encryption Utilities
 * Uses Web Crypto API for client-side encryption/decryption
 * Messages are encrypted before being sent to Firebase
 */

class MessageEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
    this.tagLength = 128; // 128 bits for GCM
  }

  /**
   * Generate a cryptographic key from user's password
   * @param {string} password - User's password or passphrase
   * @param {Uint8Array} salt - Random salt
   * @returns {Promise<CryptoKey>} - Generated encryption key
   */
  async generateKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random salt
   * @returns {Uint8Array} - Random salt
   */
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  /**
   * Generate a random IV
   * @returns {Uint8Array} - Random initialization vector
   */
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Encrypt a message
   * @param {string} message - Message to encrypt
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Encrypted data with salt and IV
   */
  async encryptMessage(message, password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      // Generate random salt and IV
      const salt = this.generateSalt();
      const iv = this.generateIV();
      
      // Generate key from password and salt
      const key = await this.generateKey(password, salt);
      
      // Encrypt the message
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );

      // Combine encrypted data with salt and IV
      const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

      // Convert to base64 for storage
      return {
        encryptedData: btoa(String.fromCharCode(...combined)),
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv))
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message
   * @param {Object} encryptedMessage - Encrypted message object
   * @param {string} password - User's password
   * @returns {Promise<string>} - Decrypted message
   */
  async decryptMessage(encryptedMessage, password) {
    try {
      // Validate encrypted message structure
      if (!encryptedMessage || typeof encryptedMessage !== 'object') {
        throw new Error('Invalid encrypted message format');
      }

      const { encryptedData, salt, iv } = encryptedMessage;
      
      if (!encryptedData || !salt || !iv) {
        throw new Error('Missing encryption parameters');
      }
      
      // Convert base64 back to Uint8Array
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
      const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
      
      // Extract encrypted data
      const ciphertext = combined.slice(saltArray.length + ivArray.length);
      
      // Generate key from password and salt
      const key = await this.generateKey(password, saltArray);
      
      // Decrypt the message
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivArray
        },
        key,
        ciphertext
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Encrypt an array of messages
   * @param {Array} messages - Array of message objects
   * @param {string} password - User's password
   * @returns {Promise<Array>} - Array of encrypted messages
   */
  async encryptMessages(messages, password) {
    const encryptedMessages = [];
    
    for (const message of messages) {
      const encryptedMessage = {
        ...message,
        text: await this.encryptMessage(message.text, password),
        encrypted: true
      };
      encryptedMessages.push(encryptedMessage);
    }
    
    return encryptedMessages;
  }

  /**
   * Decrypt an array of messages
   * @param {Array} messages - Array of encrypted message objects
   * @param {string} password - User's password
   * @returns {Promise<Array>} - Array of decrypted messages
   */
  async decryptMessages(messages, password) {
    const decryptedMessages = [];
    let hasFailedDecryption = false;
    
    for (const message of messages) {
      // Check if message is properly encrypted
      if (message.encrypted && message.text && typeof message.text === 'object' && message.text.encryptedData) {
        try {
          const decryptedMessage = {
            ...message,
            text: await this.decryptMessage(message.text, password),
            encrypted: false
          };
          decryptedMessages.push(decryptedMessage);
        } catch (decryptError) {
          console.warn('Failed to decrypt individual message:', decryptError.message);
          hasFailedDecryption = true;
          // Don't add failed messages to the array - they'll be cleared
        }
      } else {
        // Message is not encrypted or is plain text, return as-is
        decryptedMessages.push(message);
      }
    }
    
    // If any decryption failed, throw error to trigger cleanup
    if (hasFailedDecryption && decryptedMessages.length === 0) {
      throw new Error('All messages failed to decrypt - encryption key mismatch');
    }
    
    return decryptedMessages;
  }

  /**
   * Generate a secure password from user ID and device info
   * @param {string} userId - User's unique ID
   * @returns {Promise<string>} - Generated password
   */
  async generateSecurePassword(userId) {
    // Use user ID + device fingerprint for password generation
    const deviceInfo = navigator.userAgent + navigator.language + screen.width + screen.height;
    const combined = userId + deviceInfo;
    
    // Hash the combined string
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Convert to hex string
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a consistent password from ONLY user ID (no device info)
   * This ensures the same password is generated across sign-ins
   * @param {string} userId - User's unique ID
   * @returns {Promise<string>} - Generated password
   */
  async generateConsistentPassword(userId) {
    // Use ONLY user ID for consistent encryption across sessions
    const staticSalt = 'mhc-buddy-encryption-v1'; // Static salt for consistency
    const combined = userId + staticSalt;
    
    // Hash the combined string
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Convert to hex string
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if a message is encrypted
   * @param {Object} message - Message object to check
   * @returns {boolean} - True if message is encrypted
   */
  isEncrypted(message) {
    return message.encrypted === true && 
           message.text && 
           typeof message.text === 'object' && 
           message.text.encryptedData;
  }
}

// Create singleton instance
const messageEncryption = new MessageEncryption();

// Storage utilities for encryption keys
class EncryptionKeyStorage {
  constructor() {
    this.keyPrefix = 'encryption_key_';
  }

  /**
   * Store encryption key for a user
   * @param {string} userId - User's ID
   * @param {string} keyHash - Hash of the encryption key
   */
  storeKeyHash(userId, keyHash) {
    try {
      localStorage.setItem(`${this.keyPrefix}${userId}`, keyHash);
    } catch (error) {
      console.error('Failed to store key hash:', error);
    }
  }

  /**
   * Get encryption key hash for a user
   * @param {string} userId - User's ID
   * @returns {string|null} - Key hash or null if not found
   */
  getKeyHash(userId) {
    try {
      return localStorage.getItem(`${this.keyPrefix}${userId}`);
    } catch (error) {
      console.error('Failed to get key hash:', error);
      return null;
    }
  }

  /**
   * Remove encryption key for a user
   * @param {string} userId - User's ID
   */
  removeKeyHash(userId) {
    try {
      localStorage.removeItem(`${this.keyPrefix}${userId}`);
    } catch (error) {
      console.error('Failed to remove key hash:', error);
    }
  }

  /**
   * Clear all encryption keys
   */
  clearAllKeys() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.keyPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear encryption keys:', error);
    }
  }
}

// Create singleton instance
const encryptionKeyStorage = new EncryptionKeyStorage();

export { messageEncryption, encryptionKeyStorage };
export default messageEncryption;
