const fs = require('fs');
const crypto = require('crypto');

// STEP 1: Generate AES-256-GCM key and 12-byte IV
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);
console.log('Base64 KEY for Supabase:', key.toString('base64'));
console.log('Base64 IV for Supabase:', iv.toString('base64'));

// STEP 2: JSON Payload
const jsonData = JSON.stringify({ hello: 'world' });
const plaintext = Buffer.from(jsonData);

// STEP 3: Encrypt using AES-GCM
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();

// STEP 4: Concatenate encrypted data + tag and base64 encode
const vaultBuffer = Buffer.concat([encrypted, tag]);
const base64Vault = vaultBuffer.toString('base64');

// STEP 5: Write to file
fs.writeFileSync('demo.vault', base64Vault);
console.log('demo.vault written. Upload this file and insert metadata into Supabase using logged KEY/IV.');