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
