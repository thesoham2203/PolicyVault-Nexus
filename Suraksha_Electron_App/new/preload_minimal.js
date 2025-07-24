const { contextBridge } = require('electron');
const path = require('path');
const { app } = require('electron');

console.log('=== STEP-BY-STEP PRELOAD STARTING ===');

// Create a debug log that will be available to renderer
const debugLog = [];
function addDebugLog(message) {
    console.log(message);
    debugLog.push(`${new Date().toISOString()}: ${message}`);
}

addDebugLog('=== STEP-BY-STEP PRELOAD STARTING ===');
addDebugLog('Current working directory: ' + process.cwd());
addDebugLog('__dirname: ' + __dirname);
addDebugLog('process.resourcesPath: ' + (process.resourcesPath || 'undefined'));
addDebugLog('app.getAppPath(): ' + (app ? app.getAppPath() : 'app not available'));

// Step 1: Prepare environment loading first
let dotenv, createClient, supabase;

try {
    addDebugLog('Step 1: Loading environment...');

    // For packaged app, try different approaches
    let envPath;
    if (process.resourcesPath) {
        // Packaged app
        envPath = path.join(process.resourcesPath, '.env');
        addDebugLog('Packaged app detected, using env path: ' + envPath);
    } else {
        // Development
        envPath = path.join(__dirname, '.env');
        addDebugLog('Development mode, using env path: ' + envPath);
    }

    // Try different paths for dotenv
    try {
        dotenv = require('dotenv');
        addDebugLog('Step 1a: Found dotenv using normal require');
    } catch (e1) {
        try {
            dotenv = require(path.join(__dirname, 'node_modules', 'dotenv'));
            addDebugLog('Step 1a: Found dotenv using absolute path');
        } catch (e2) {
            addDebugLog('Step 1a: Cannot find dotenv module. Error1: ' + e1.message + ', Error2: ' + e2.message);
        }
    }

    if (dotenv) {
        // Try to load .env file with proper path
        try {
            dotenv.config({ path: envPath, debug: false, override: false });
            addDebugLog('Step 1: Environment loaded successfully with dotenv from: ' + envPath);
        } catch (envError) {
            addDebugLog('Step 1: Failed to load env file, trying default config. Error: ' + envError.message);
            dotenv.config({ debug: false, override: false });
        }
    } else {
        addDebugLog('Step 1: Continuing without dotenv, checking process.env directly');
    }

    // Fallback: Set environment variables manually if not loaded
    if (!process.env.SUPABASE_URL) {
        process.env.SUPABASE_URL = 'https://pqkkmddkvcvyfnyctyct.supabase.co';
        addDebugLog('Step 1: Set fallback SUPABASE_URL');
    }
    if (!process.env.SUPABASE_KEY) {
        process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM';
        addDebugLog('Step 1: Set fallback SUPABASE_KEY');
    }

    addDebugLog('SUPABASE_URL: ' + (process.env.SUPABASE_URL ? 'Loaded' : 'Missing'));
    addDebugLog('SUPABASE_KEY: ' + (process.env.SUPABASE_KEY ? 'Loaded' : 'Missing'));
} catch (err) {
    addDebugLog('Step 1 FAILED: ' + err.message);
}

// Step 2: Test Supabase client creation
try {
    addDebugLog('Step 2: Creating Supabase client...');
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        // Try different paths for @supabase/supabase-js
        try {
            createClient = require('@supabase/supabase-js').createClient;
            addDebugLog('Step 2a: Found @supabase/supabase-js using normal require');
        } catch (e1) {
            try {
                createClient = require(path.join(__dirname, 'node_modules', '@supabase', 'supabase-js')).createClient;
                addDebugLog('Step 2a: Found @supabase/supabase-js using absolute path');
            } catch (e2) {
                addDebugLog('Step 2a: Cannot find @supabase/supabase-js. Error1: ' + e1.message + ', Error2: ' + e2.message);
            }
        }

        if (createClient) {
            supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_KEY
            );
            addDebugLog('Step 2: Supabase client created successfully');
        } else {
            addDebugLog('Step 2: Skipped - @supabase/supabase-js not found');
        }
    } else {
        addDebugLog('Step 2: Skipped - missing environment variables');
    }
} catch (err) {
    addDebugLog('Step 2 FAILED: ' + err.message);
}

// Step 3: Expose complete API (only once)
try {
    addDebugLog('Step 3: Exposing complete API...');

    const apiMethods = {
        test: () => {
            console.log('API test called');
            return 'API working!';
        },
        getDebugLog: () => {
            return debugLog;
        }
    };

    // Add Supabase methods only if Supabase is available
    if (supabase) {
        addDebugLog('Step 3a: Adding Supabase methods to API');

        apiMethods.testSupabase = async () => {
            console.log('Testing Supabase connection...');

            const { data, error, count } = await supabase
                .from('secure_files')
                .select('filename', { count: 'exact' })
                .limit(5);

            if (error) {
                throw new Error('Supabase test failed: ' + error.message);
            }

            return { success: true, count, filenames: data?.map(item => item.filename) };
        };

        apiMethods.listSecureFiles = async () => {
            console.log('Listing secure files...');

            const { data, error } = await supabase
                .from('secure_files')
                .select('filename, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error('Failed to list files: ' + error.message);
            }

            return data;
        };

        apiMethods.openSecureFileFromContent = async (fileContent, filename, password) => {
            console.log('openSecureFileFromContent called with filename:', filename);
            console.log('File content preview:', fileContent.substring(0, 100) + '...');
            console.log('Password length:', password.length);

            // Try multiple decryption methods
            
            // Method 1: Try Supabase-based decryption (existing method)
            if (supabase) {
                try {
                    console.log('Attempting Supabase-based decryption...');
                    return await decryptWithSupabase(fileContent, filename, password);
                } catch (error) {
                    console.log('Supabase decryption failed:', error.message);
                }
            }

            // Method 2: Try password-based decryption (for standalone vault files)
            try {
                console.log('Attempting password-based decryption...');
                return await decryptWithPassword(fileContent, password);
            } catch (error) {
                console.log('Password-based decryption failed:', error.message);
            }

            // Method 3: Try legacy format decryption
            try {
                console.log('Attempting legacy format decryption...');
                return await decryptLegacyFormat(fileContent, password);
            } catch (error) {
                console.log('Legacy decryption failed:', error.message);
            }

            throw new Error('Unable to decrypt file with any supported method. Please check the file format and password.');
        };

        // Supabase-based decryption (original method)
        async function decryptWithSupabase(fileContent, filename, password) {
            // Get file metadata from Supabase
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

            // Load bcrypt for password verification
            let bcrypt;
            try {
                bcrypt = require('bcryptjs');
            } catch (e) {
                throw new Error('Cannot load bcryptjs module');
            }

            // Verify password
            console.log('Verifying password...');
            const match = await bcrypt.compare(password, data.password_hash);
            if (!match) throw new Error('Invalid password');

            console.log('Password verified, decrypting with stored AES key...');

            // Load crypto for decryption
            const crypto = require('crypto');

            // Use the stored AES key from database (not derived from password)
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

            console.log('Decryption successful');
            return JSON.parse(decrypted.toString('utf8'));
        }

        // Password-based decryption for standalone vault files
        async function decryptWithPassword(fileContent, password) {
            const crypto = require('crypto');
            
            console.log('Trying password-based key derivation...');
            
            // Try to parse the vault file content
            let vaultData;
            try {
                // First, try to parse as JSON (newer format)
                vaultData = JSON.parse(fileContent);
                console.log('Vault file is JSON format');
            } catch (e) {
                // If not JSON, assume it's base64 encoded binary data
                console.log('Vault file is binary format');
                vaultData = { encryptedData: fileContent };
            }

            // If it's a structured vault file with salt and IV
            if (vaultData.salt && vaultData.iv && vaultData.encryptedData) {
                console.log('Found structured vault format with salt and IV');
                
                const salt = Buffer.from(vaultData.salt, 'hex');
                const iv = Buffer.from(vaultData.iv, 'hex');
                const encryptedData = Buffer.from(vaultData.encryptedData, 'base64');
                
                // Derive key from password and salt
                const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
                
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                const decrypted = Buffer.concat([
                    decipher.update(encryptedData),
                    decipher.final()
                ]);
                
                return JSON.parse(decrypted.toString('utf8'));
            }
            
            // Try simple AES-256-GCM with password-derived key
            const salt = Buffer.from(password + 'salt', 'utf8').slice(0, 16);
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
            const iv = crypto.pbkdf2Sync(password, salt, 100000, 12, 'sha256');
            
            const vaultBuffer = Buffer.from(fileContent, 'base64');
            const tag = vaultBuffer.slice(-16);
            const encrypted = vaultBuffer.slice(0, -16);
            
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(tag);
            
            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
            ]);
            
            return JSON.parse(decrypted.toString('utf8'));
        }

        // Legacy format decryption
        async function decryptLegacyFormat(fileContent, password) {
            const crypto = require('crypto');
            
            console.log('Trying legacy format...');
            
            // Try different legacy encryption methods
            const methods = [
                'aes-256-cbc',
                'aes-192-cbc', 
                'aes-128-cbc',
                'aes-256-ctr'
            ];
            
            for (const method of methods) {
                try {
                    console.log('Trying method:', method);
                    
                    const key = crypto.createHash('sha256').update(password).digest();
                    const iv = crypto.createHash('md5').update(password).digest();
                    
                    const decipher = crypto.createDecipheriv(method, key, iv.slice(0, 16));
                    const encrypted = Buffer.from(fileContent, 'base64');
                    
                    const decrypted = Buffer.concat([
                        decipher.update(encrypted),
                        decipher.final()
                    ]);
                    
                    const result = JSON.parse(decrypted.toString('utf8'));
                    console.log('Success with method:', method);
                    return result;
                } catch (e) {
                    console.log('Method', method, 'failed:', e.message);
                    continue;
                }
            }
            
            throw new Error('No legacy format worked');
        }
    } else {
        addDebugLog('Step 3a: Supabase not available, skipping Supabase methods');
    }

    // Expose the complete API
    contextBridge.exposeInMainWorld('api', apiMethods);

    addDebugLog('Step 3: Complete API exposed successfully with ' + Object.keys(apiMethods).length + ' methods');
    addDebugLog('Available methods: ' + Object.keys(apiMethods).join(', '));
} catch (err) {
    addDebugLog('Step 3 FAILED: ' + err.message);
}

addDebugLog('=== STEP-BY-STEP PRELOAD COMPLETE ===');
