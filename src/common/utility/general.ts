import {cryptoSecretKey} from '@env';
import CryptoJS from 'crypto-js';

export const toTitleCase = (str: string) => {
  return str
    .toLowerCase() // first make everything lowercase
    .replace(/\b\w/g, char => char.toUpperCase()); // capitalize first letter of each word
};

export const decrypt = (value: string) => {
  try {
    // Decode URL-safe string
    const decoded = decodeURIComponent(value);

    const bytes = CryptoJS.AES.decrypt(decoded, cryptoSecretKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    return plaintext; // original string
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const maskEmail = (email: string) => {
  if (!email.includes('@')) return email;

  const [username, domain] = email.split('@');

  // If username is too short, mask everything except first char
  if (username.length <= 4) {
    return (
      username.charAt(0) +
      '*'.repeat(Math.max(username.length - 1, 0)) +
      '@' +
      domain
    );
  }

  const start = username.slice(0, 2);
  const end = username.slice(-2);
  const maskedCount = Math.max(username.length - 4, 0);

  return start + '*'.repeat(maskedCount) + end + '@' + domain;
};
