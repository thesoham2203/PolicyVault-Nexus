const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Testing Supabase connection directly...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Loaded' : 'Missing');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function testConnection() {
    try {
        console.log('Testing connection...');

        // Test 1: Count records
        const { data, error, count } = await supabase
            .from('secure_files')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Supabase error:', error);
            return;
        }

        console.log('✅ Connection successful!');
        console.log('Total records:', count);
        console.log('Sample data:', data?.slice(0, 3));

        // Test 2: List filenames
        const { data: files, error: filesError } = await supabase
            .from('secure_files')
            .select('filename, created_at')
            .order('created_at', { ascending: false });

        if (filesError) {
            console.error('Error listing files:', filesError);
            return;
        }

        console.log('Available files:');
        files?.forEach(file => {
            console.log(`  - ${file.filename} (${file.created_at})`);
        });

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testConnection();
