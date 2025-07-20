const { contextBridge } = require('electron');

console.log('=== PRELOAD TEST SCRIPT STARTING ===');

try {
    console.log('Attempting to expose context bridge...');

    contextBridge.exposeInMainWorld('api', {
        test: () => {
            console.log('API test function called');
            return 'API is working!';
        }
    });

    console.log('Context bridge API exposed successfully');
} catch (err) {
    console.error('Failed to expose context bridge API:', err);
}

console.log('=== PRELOAD TEST SCRIPT COMPLETE ===');
