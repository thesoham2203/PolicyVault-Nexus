// Test decryption manually
const fs = require('fs');
const path = require('path');

console.log('=== MANUAL DECRYPTION TEST ===');

// Load the vault file
const vaultPath = path.join(__dirname, 'test_encrypted.vault');
const password = 'CdO88lYyK2@2B4oq';

console.log('Vault file:', vaultPath);
console.log('Password:', password);

// Check if file exists
if (!fs.existsSync(vaultPath)) {
    console.error('❌ Vault file not found!');
    process.exit(1);
}

// Read file content
const fileContent = fs.readFileSync(vaultPath, 'utf8');
console.log('File content length:', fileContent.length);
console.log('Content preview:', fileContent.substring(0, 100) + '...');

// Test Supabase-based decryption approach
async function testSupabaseDecryption() {
    console.log('\n=== TESTING SUPABASE-BASED DECRYPTION ===');

    try {
        // Load required modules
        const { createClient } = require('@supabase/supabase-js');
        const bcrypt = require('bcryptjs');
        const crypto = require('crypto');

        // Initialize Supabase
        const supabaseUrl = 'https://pqkkmddkvcvyfnyctyct.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM';

        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client created');

        // Get metadata for test_encrypted_6mcxw9sd.vault
        const filename = 'test_encrypted_6mcxw9sd.vault';
        console.log('Looking up metadata for:', filename);

        const { data, error } = await supabase
            .from('secure_files')
            .select('password_hash, aes_key, iv')
            .eq('filename', filename)
            .single();

        if (error) {
            throw new Error('Metadata fetch failed: ' + error.message);
        }

        if (!data) {
            throw new Error('No metadata found for this file');
        }

        console.log('✅ Metadata found');
        console.log('AES Key length:', Buffer.from(data.aes_key, 'base64').length);
        console.log('IV length:', Buffer.from(data.iv, 'base64').length);

        // Verify password
        console.log('Verifying password...');
        const match = await bcrypt.compare(password, data.password_hash);
        if (!match) {
            throw new Error('Invalid password');
        }
        console.log('✅ Password verified');

        // Decrypt using stored AES key
        const key = Buffer.from(data.aes_key, 'base64');
        const iv = Buffer.from(data.iv, 'base64');

        console.log('Key length:', key.length, 'IV length:', iv.length);
        console.log('File content length:', fileContent.length);

        const vaultBuffer = Buffer.from(fileContent, 'base64');
        console.log('Vault buffer length:', vaultBuffer.length);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        const tag = vaultBuffer.slice(-16);
        const encrypted = vaultBuffer.slice(0, -16);

        console.log('Tag length:', tag.length, 'Encrypted length:', encrypted.length);

        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        console.log('✅ Decryption successful');
        const result = JSON.parse(decrypted.toString('utf8'));
        console.log('✅ JSON parsing successful');
        console.log('Decrypted data keys:', Object.keys(result));

        return result;

    } catch (error) {
        console.error('❌ Supabase decryption failed:', error.message);
        return null;
    }
}

// Run the test
testSupabaseDecryption().then(result => {
    if (result) {
        console.log('\n🎉 SUCCESS! Decryption worked!');
        console.log('Decrypted data:', JSON.stringify(result, null, 2));
    } else {
        console.log('\n❌ Decryption failed');
    }
}).catch(error => {
    console.error('Test failed:', error);
});
