/**
 * Centralized Encryption Manager
 * Provides unified encryption/decryption for chat, journal, and community
 */

import { messageEncryption, encryptionKeyStorage } from './encryption';

class EncryptionManager {
  constructor() {
    this.passwords = new Map(); // Store passwords per user
    this.initialized = new Map(); // Track initialization per user
  }

  /**
   * Initialize encryption for a user
   * @param {string} userId - User's unique ID
   * @returns {Promise<string>} - Generated encryption password
   */
  async initializeForUser(userId) {
    if (this.initialized.get(userId)) {
      return this.passwords.get(userId);
    }

    try {
      // Generate encryption password based on user ID and device info
      const password = await messageEncryption.generateSecurePassword(userId);
      this.passwords.set(userId, password);

      // Store key hash for verification
      const keyHash = await messageEncryption.generateSecurePassword(userId + '_hash');
      encryptionKeyStorage.storeKeyHash(userId, keyHash);

      this.initialized.set(userId, true);
      console.log('🔐 Encryption initialized for user:', userId);

      return password;
    } catch (error) {
      console.error('❌ Failed to initialize encryption:', error);
      throw error;
    }
  }

  /**
   * Get encryption password for a user (initializes if needed)
   * @param {string} userId - User's unique ID
   * @returns {Promise<string>} - Encryption password
   */
  async getPassword(userId) {
    if (!this.passwords.has(userId)) {
      return await this.initializeForUser(userId);
    }
    return this.passwords.get(userId);
  }

  /**
   * Encrypt text data
   * @param {string} text - Text to encrypt
   * @param {string} userId - User's unique ID
   * @returns {Promise<Object>} - Encrypted data object
   */
  async encryptText(text, userId) {
    try {
      const password = await this.getPassword(userId);
      return await messageEncryption.encryptMessage(text, password);
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt text data
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} userId - User's unique ID
   * @returns {Promise<string>} - Decrypted text
   */
  async decryptText(encryptedData, userId) {
    try {
      const password = await this.getPassword(userId);
      return await messageEncryption.decryptMessage(encryptedData, password);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  /**
   * Encrypt a journal entry
   * @param {Object} entry - Journal entry object
   * @param {string} userId - User's unique ID
   * @returns {Promise<Object>} - Encrypted entry
   */
  async encryptJournalEntry(entry, userId) {
    try {
      const password = await this.getPassword(userId);
      const encryptedTitle = entry.title ? await messageEncryption.encryptMessage(entry.title, password) : null;
      const encryptedContent = await messageEncryption.encryptMessage(entry.content, password);

      return {
        ...entry,
        title: encryptedTitle,
        content: encryptedContent,
        encrypted: true
      };
    } catch (error) {
      console.error('Journal encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt a journal entry
   * @param {Object} entry - Encrypted journal entry object
   * @param {string} userId - User's unique ID
   * @returns {Promise<Object>} - Decrypted entry
   */
  async decryptJournalEntry(entry, userId) {
    if (!entry.encrypted) {
      return entry; // Already decrypted
    }

    try {
      const password = await this.getPassword(userId);
      
      let decryptedTitle = entry.title;
      let decryptedContent = entry.content;

      // Decrypt title if it's encrypted
      if (entry.title && typeof entry.title === 'object' && entry.title.encryptedData) {
        decryptedTitle = await messageEncryption.decryptMessage(entry.title, password);
      }

      // Decrypt content if it's encrypted
      if (entry.content && typeof entry.content === 'object' && entry.content.encryptedData) {
        decryptedContent = await messageEncryption.decryptMessage(entry.content, password);
      }

      return {
        ...entry,
        title: decryptedTitle,
        content: decryptedContent,
        encrypted: false
      };
    } catch (error) {
      console.error('Journal decryption error:', error);
      // Return original if decryption fails
      return {
        ...entry,
        title: typeof entry.title === 'string' ? entry.title : 'Encrypted Title',
        content: typeof entry.content === 'string' ? entry.content : 'Content unavailable (decryption failed)',
        encrypted: false,
        decryptionFailed: true
      };
    }
  }

  /**
   * Encrypt multiple journal entries
   * @param {Array} entries - Array of journal entry objects
   * @param {string} userId - User's unique ID
   * @returns {Promise<Array>} - Array of encrypted entries
   */
  async encryptJournalEntries(entries, userId) {
    const encrypted = [];
    for (const entry of entries) {
      encrypted.push(await this.encryptJournalEntry(entry, userId));
    }
    return encrypted;
  }

  /**
   * Decrypt multiple journal entries
   * @param {Array} entries - Array of encrypted journal entry objects
   * @param {string} userId - User's unique ID
   * @returns {Promise<Array>} - Array of decrypted entries
   */
  async decryptJournalEntries(entries, userId) {
    const decrypted = [];
    for (const entry of entries) {
      decrypted.push(await this.decryptJournalEntry(entry, userId));
    }
    return decrypted;
  }

  /**
   * Encrypt a community post
   * @param {Object} post - Post object
   * @param {string} userId - User's unique ID
   * @returns {Promise<Object>} - Encrypted post
   */
  async encryptPost(post, userId) {
    try {
      const password = await this.getPassword(userId);
      const encryptedContent = await messageEncryption.encryptMessage(post.content, password);

      return {
        ...post,
        content: encryptedContent,
        encrypted: true
      };
    } catch (error) {
      console.error('Post encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt a community post
   * @param {Object} post - Encrypted post object
   * @param {string} userId - User's unique ID
   * @returns {Promise<Object>} - Decrypted post
   */
  async decryptPost(post, userId) {
    if (!post.encrypted) {
      return post; // Already decrypted
    }

    try {
      const password = await this.getPassword(userId);
      
      let decryptedContent = post.content;

      // Decrypt content if it's encrypted
      if (post.content && typeof post.content === 'object' && post.content.encryptedData) {
        decryptedContent = await messageEncryption.decryptMessage(post.content, password);
      }

      return {
        ...post,
        content: decryptedContent,
        encrypted: false
      };
    } catch (error) {
      console.error('Post decryption error:', error);
      // Return original if decryption fails
      return {
        ...post,
        content: typeof post.content === 'string' ? post.content : 'Content unavailable (decryption failed)',
        encrypted: false,
        decryptionFailed: true
      };
    }
  }

  /**
   * Encrypt chat messages
   * @param {Array} messages - Array of message objects
   * @param {string} userId - User's unique ID
   * @returns {Promise<Array>} - Array of encrypted messages
   */
  async encryptMessages(messages, userId) {
    try {
      const password = await this.getPassword(userId);
      return await messageEncryption.encryptMessages(messages, password);
    } catch (error) {
      console.error('Messages encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt chat messages
   * @param {Array} messages - Array of encrypted message objects
   * @param {string} userId - User's unique ID
   * @returns {Promise<Array>} - Array of decrypted messages
   */
  async decryptMessages(messages, userId) {
    try {
      const password = await this.getPassword(userId);
      return await messageEncryption.decryptMessages(messages, password);
    } catch (error) {
      console.error('Messages decryption error:', error);
      throw error;
    }
  }

  /**
   * Clear encryption data for a user
   * @param {string} userId - User's unique ID
   */
  clearUserData(userId) {
    this.passwords.delete(userId);
    this.initialized.delete(userId);
    encryptionKeyStorage.removeKeyHash(userId);
    console.log('🗑️ Encryption data cleared for user:', userId);
  }

  /**
   * Check if text/object is encrypted
   * @param {*} data - Data to check
   * @returns {boolean} - True if encrypted
   */
  isEncrypted(data) {
    return data && typeof data === 'object' && data.encryptedData;
  }
}

// Create singleton instance
const encryptionManager = new EncryptionManager();

export default encryptionManager;
export { encryptionManager };
