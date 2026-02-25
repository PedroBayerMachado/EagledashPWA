const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const ITERATIONS = 100000;
const SALT = new TextEncoder().encode('eagledash-salt-2025'); // Static salt for simplicity in this context

async function deriveKey(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, pin: string): Promise<{ encrypted: string; iv: string }> {
  const key = await deriveKey(pin);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encodedData
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptData(encryptedBase64: string, ivBase64: string, pin: string): Promise<string> {
  try {
    const key = await deriveKey(pin);
    const encryptedBuffer = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encryptedBuffer
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error('Decryption failed', e);
    throw new Error('Falha na descriptografia. PIN incorreto?');
  }
}
