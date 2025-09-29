/* eslint-env browser */
/* global CryptoKey */
import { API_BASE_URL } from '@/config/api';

const SERVER_PUBLIC_KEY_URL = `${API_BASE_URL}/auth/public-key`;

async function fetchServerPublicKey(): Promise<CryptoKey> {
  const res = await fetch(SERVER_PUBLIC_KEY_URL);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Failed to fetch server public key', res.status, text);
    throw new Error('Failed to fetch server public key');
  }

  const jwk = await res.json();
  try {
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  } catch (err) {
    console.error('Failed to import server public key as JWK', err, jwk);
    throw err;
  }
}

let cachedKey: CryptoKey | null = null;

async function getServerKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await fetchServerPublicKey();
  return cachedKey;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function encryptWithServerPublicKey(plaintext: string): Promise<string> {
  const key = await getServerKey();
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded);
  return arrayBufferToBase64(encrypted);
}

// Expose a simple debug helper

export default { encryptWithServerPublicKey };
