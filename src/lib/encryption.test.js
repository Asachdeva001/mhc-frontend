/**
 * Simple test for encryption functionality
 * This can be run in the browser console to verify encryption works
 */

import { messageEncryption } from './encryption.js';

// Test function that can be called from browser console
window.testEncryption = async function() {
  console.log('🧪 Testing encryption functionality...');
  
  try {
    const testPassword = 'test-password-123';
    const testMessage = 'This is a test message for encryption!';
    
    console.log('📝 Original message:', testMessage);
    
    // Test single message encryption
    console.log('🔐 Encrypting message...');
    const encrypted = await messageEncryption.encryptMessage(testMessage, testPassword);
    console.log('🔒 Encrypted data:', encrypted);
    
    // Test decryption
    console.log('🔓 Decrypting message...');
    const decrypted = await messageEncryption.decryptMessage(encrypted, testPassword);
    console.log('📖 Decrypted message:', decrypted);
    
    // Verify they match
    if (testMessage === decrypted) {
      console.log('✅ Single message encryption test PASSED');
    } else {
      console.error('❌ Single message encryption test FAILED');
      return false;
    }
    
    // Test multiple messages
    console.log('\n🧪 Testing multiple messages encryption...');
    const testMessages = [
      { text: 'Hello, how are you?', sender: 'user', timestamp: '10:00' },
      { text: 'I am doing well, thank you!', sender: 'ai', timestamp: '10:01' },
      { text: 'That is great to hear!', sender: 'user', timestamp: '10:02' }
    ];
    
    console.log('📝 Original messages:', testMessages);
    
    const encryptedMessages = await messageEncryption.encryptMessages(testMessages, testPassword);
    console.log('🔒 Encrypted messages:', encryptedMessages);
    
    const decryptedMessages = await messageEncryption.decryptMessages(encryptedMessages, testPassword);
    console.log('📖 Decrypted messages:', decryptedMessages);
    
    // Verify all messages match
    let allMatch = true;
    for (let i = 0; i < testMessages.length; i++) {
      if (testMessages[i].text !== decryptedMessages[i].text) {
        allMatch = false;
        break;
      }
    }
    
    if (allMatch) {
      console.log('✅ Multiple messages encryption test PASSED');
    } else {
      console.error('❌ Multiple messages encryption test FAILED');
      return false;
    }
    
    // Test password generation
    console.log('\n🧪 Testing password generation...');
    const userId = 'test-user-123';
    const generatedPassword = await messageEncryption.generateSecurePassword(userId);
    console.log('🔑 Generated password length:', generatedPassword.length);
    
    if (generatedPassword && generatedPassword.length > 0) {
      console.log('✅ Password generation test PASSED');
    } else {
      console.error('❌ Password generation test FAILED');
      return false;
    }
    
    // Test encryption detection
    console.log('\n🧪 Testing encryption detection...');
    const isEncrypted = messageEncryption.isEncrypted(encryptedMessages[0]);
    const isNotEncrypted = messageEncryption.isEncrypted(testMessages[0]);
    
    if (isEncrypted && !isNotEncrypted) {
      console.log('✅ Encryption detection test PASSED');
    } else {
      console.error('❌ Encryption detection test FAILED');
      return false;
    }
    
    console.log('\n🎉 All encryption tests PASSED! 🔐');
    return true;
    
  } catch (error) {
    console.error('❌ Encryption test failed with error:', error);
    return false;
  }
};

// Test with wrong password
window.testWrongPassword = async function() {
  console.log('🧪 Testing wrong password decryption...');
  
  try {
    const testPassword = 'correct-password';
    const wrongPassword = 'wrong-password';
    const testMessage = 'This should fail to decrypt';
    
    const encrypted = await messageEncryption.encryptMessage(testMessage, testPassword);
    
    try {
      await messageEncryption.decryptMessage(encrypted, wrongPassword);
      console.error('❌ Wrong password test FAILED - should have thrown error');
      return false;
    } catch (error) {
      console.log('✅ Wrong password correctly rejected:', error.message);
      return true;
    }
  } catch (error) {
    console.error('❌ Wrong password test failed with error:', error);
    return false;
  }
};

// Run tests automatically if in browser
if (typeof window !== 'undefined') {
  console.log('🔐 Encryption test functions loaded!');
  console.log('Run window.testEncryption() to test encryption');
  console.log('Run window.testWrongPassword() to test wrong password handling');
}
