const { contextBridge } = require('electron');
const fs = require('fs').promises;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('Starting preload script...');

// Load environment variables
let supabase;
try {
    require('dotenv').config({ debug: false, override: false });
    console.log('Dotenv loaded successfully');

    // Verify environment variables are loaded
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'Missing');
    console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Loaded' : 'Missing');

    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        const { createClient } = require('@supabase/supabase-js');
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );
        console.log('Supabase client created successfully');

        // Test Supabase connection
        supabase.from('secure_files').select('count', { count: 'exact' }).then(
            result => {
                if (result.error) {
                    console.error('Supabase connection test failed:', result.error);
                } else {
                    console.log('Supabase connection test successful. Records in secure_files:', result.count);
                }
            }
        ).catch(err => {
            console.error('Supabase connection test error:', err);
        });

    } else {
        console.warn('Supabase environment variables missing');
    }
} catch (err) {
    console.error('Environment setup failed:', err);
}

console.log('Preload script loaded');

try {
    contextBridge.exposeInMainWorld('api', {
        test: () => {
            console.log('API test function called');
            return 'API is working!';
        },
        testSupabase: async () => {
            console.log('Testing Supabase connection...');
            if (!supabase) {
                throw new Error('Supabase not initialized');
            }

            try {
                const { data, error, count } = await supabase
                    .from('secure_files')
                    .select('filename', { count: 'exact' })
                    .limit(5);

                if (error) {
                    console.error('Supabase test error:', error);
                    throw new Error('Supabase test failed: ' + error.message);
                }

                console.log('Supabase test successful. Found', count, 'records');
                console.log('Sample filenames:', data?.map(item => item.filename));
                return { success: true, count, filenames: data?.map(item => item.filename) };
            } catch (err) {
                console.error('Supabase test exception:', err);
                throw err;
            }
        },
        listSecureFiles: async () => {
            console.log('Listing secure files...');
            if (!supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await supabase
                .from('secure_files')
                .select('filename, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error listing files:', error);
                throw new Error('Failed to list files: ' + error.message);
            }

            console.log('Found files:', data);
            return data;
        },
        openSecureFile: async (filePath, password) => {
            console.log('openSecureFile called with:', filePath);
            try {
                const dataB64 = await fs.readFile(filePath, 'utf8');
                const filename = path.basename(filePath);

                console.log('Reading file:', filename);

                if (!supabase) {
                    throw new Error('Supabase not initialized');
                }

                console.log('Fetching metadata for file:', filename);
                const { data, error } = await supabase
                    .from('secure_files')
                    .select('password_hash, aes_key, iv')
                    .eq('filename', filename)
                    .single();

                if (error) {
                    console.error('Supabase error:', error);
                    throw new Error('Metadata fetch failed: ' + error.message);
                }

                if (!data) {
                    throw new Error('No metadata found for this file');
                }

                console.log('Metadata found, verifying password...');
                const match = await bcrypt.compare(password, data.password_hash);
                if (!match) throw new Error('Invalid password');

                console.log('Password verified, decrypting file...');
                const key = crypto.createHash('sha256').update(password).digest();
                const iv = Buffer.from(data.iv, 'base64');

                const vaultBuffer = Buffer.from(dataB64, 'base64');
                const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
                const tag = vaultBuffer.slice(-16);
                const encrypted = vaultBuffer.slice(0, -16);
                decipher.setAuthTag(tag);

                const decrypted = Buffer.concat([
                    decipher.update(encrypted),
                    decipher.final()
                ]);

                console.log('File decrypted successfully');
                return JSON.parse(decrypted.toString('utf8'));
            } catch (err) {
                console.error('Error in openSecureFile:', err);
                throw new Error(err.message);
            }
        },
        openSecureFileFromContent: async (fileContent, filename, password) => {
            console.log('openSecureFileFromContent called with filename:', filename);
            try {
                console.log('Processing file:', filename);

                if (!supabase) {
                    throw new Error('Supabase not initialized');
                }

                console.log('Fetching metadata for file:', filename);
                const { data, error } = await supabase
                    .from('secure_files')
                    .select('password_hash, aes_key, iv')
                    .eq('filename', filename)
                    .single();

                if (error) {
                    console.error('Supabase error:', error);
                    throw new Error('Metadata fetch failed: ' + error.message);
                }

                if (!data) {
                    throw new Error('No metadata found for this file');
                }

                console.log('Metadata found, verifying password...');
                const match = await bcrypt.compare(password, data.password_hash);
                if (!match) throw new Error('Invalid password');

                console.log('Password verified, decrypting file...');
                const key = crypto.createHash('sha256').update(password).digest();
                const iv = Buffer.from(data.iv, 'base64');

                const vaultBuffer = Buffer.from(fileContent, 'base64');
                const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
                const tag = vaultBuffer.slice(-16);
                const encrypted = vaultBuffer.slice(0, -16);
                decipher.setAuthTag(tag);

                const decrypted = Buffer.concat([
                    decipher.update(encrypted),
                    decipher.final()
                ]);

                console.log('File decrypted successfully');
                return JSON.parse(decrypted.toString('utf8'));
            } catch (err) {
                console.error('Error in openSecureFileFromContent:', err);
                throw new Error(err.message);
            }
        }
    });
    console.log('Context bridge API exposed successfully');
} catch (err) {
    console.error('Failed to expose context bridge API:', err);
}
