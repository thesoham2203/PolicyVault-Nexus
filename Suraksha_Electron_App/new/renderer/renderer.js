// Modern PolicyVault Renderer
class PolicyVault {
    constructor() {
        this.api = null;
        this.isInitialized = false;
        this.statusBar = null;
        this.init();
    }

    async init() {
        // Disable console in production
        this.disableConsoleInProduction();

        console.log('=== PolicyVault Initializing ===');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    disableConsoleInProduction() {
        // Only disable console in packaged production builds
        // Keep console enabled for development and debugging
        const isPackaged = typeof process !== 'undefined' && 
                          process.resourcesPath && 
                          window.location.protocol === 'file:';
        
        console.log('Environment check:', {
            isPackaged,
            hasResourcesPath: typeof process !== 'undefined' && !!process.resourcesPath,
            protocol: window.location.protocol,
            nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown'
        });
        
        if (isPackaged) {
            console.log('Production build detected - applying security measures');
            const noop = () => { };
            setTimeout(() => {
                console.log = noop;
                console.warn = noop;
                console.error = noop;
                console.info = noop;
                console.debug = noop;
                console.trace = noop;
                console.dir = noop;
                console.dirxml = noop;
                console.table = noop;
                console.group = noop;
                console.groupEnd = noop;
                console.clear = noop;
                console.assert = noop;
            }, 5000); // Delay console disabling by 5 seconds to allow debugging
        } else {
            console.log('Development mode detected - keeping console enabled');
        }

        // Additional security: Disable common debugging methods (only in packaged builds)
        if (isPackaged) {
            setTimeout(() => {
                window.eval = () => { throw new Error('eval() is disabled for security'); };
                window.Function = () => { throw new Error('Function constructor is disabled for security'); };
                
                // Disable global error handling that could expose information
                window.addEventListener('error', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
                
                window.addEventListener('unhandledrejection', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            }, 5000);
        }
    }    async initializeApp() {
        console.log('=== App Initialization Starting ===');

        // Initialize security measures first
        this.initializeSecurity();

        // Initialize UI elements
        this.initializeUI();

        // Wait for API
        await this.waitForAPI();

        // Setup event listeners
        this.setupEventListeners();

        // Auto-connect and test
        await this.autoConnect();

        this.isInitialized = true;
        this.showToast('success', 'System Ready', 'PolicyVault is ready for secure operations');
    }

    initializeSecurity() {
        // Disable console access to prevent data extraction
        const originalConsole = console;
        const secureConsole = {
            log: () => { },
            warn: () => { },
            error: () => { },
            info: () => { },
            debug: () => { },
            trace: () => { },
            dir: () => { },
            dirxml: () => { },
            table: () => { },
            group: () => { },
            groupEnd: () => { },
            clear: () => { },
            assert: () => { }
        };

        // Override console methods when sensitive content is displayed
        window.disableConsole = () => {
            Object.assign(console, secureConsole);
        };

        window.enableConsole = () => {
            Object.assign(console, originalConsole);
        };

        // Prevent access to the PolicyVault instance
        Object.defineProperty(window, 'policyVault', {
            configurable: false,
            writable: false
        });

        // Clear any potential references to sensitive data
        window.addEventListener('beforeunload', () => {
            // Clear any cached content
            if (this.currentContent) {
                this.currentContent = null;
            }
            // Clear content display
            const contentElements = document.querySelectorAll('.content-json');
            contentElements.forEach(el => {
                el.textContent = '';
                el.innerHTML = '';
            });
        });
    }

    initializeUI() {
        console.log('Initializing UI elements...');

        // Get UI elements with error checking
        this.statusBar = document.getElementById('connectionStatus');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');
        this.connectionInfo = document.getElementById('connectionInfo');
        this.fileInput = document.getElementById('fileInput');
        this.fileInputLabel = document.querySelector('.file-input-label');
        this.fileInputText = document.getElementById('fileInputText');
        this.passwordInput = document.getElementById('passwordInput');
        this.openBtn = document.getElementById('openBtn');
        this.filesList = document.getElementById('filesList');
        this.contentDisplay = document.getElementById('contentDisplay');
        this.contentSubtitle = document.getElementById('contentSubtitle');

        // Log missing elements for debugging
        const elements = {
            statusBar: this.statusBar,
            statusIcon: this.statusIcon,
            statusText: this.statusText,
            connectionInfo: this.connectionInfo,
            fileInput: this.fileInput,
            fileInputLabel: this.fileInputLabel,
            fileInputText: this.fileInputText,
            passwordInput: this.passwordInput,
            openBtn: this.openBtn,
            filesList: this.filesList,
            contentDisplay: this.contentDisplay,
            contentSubtitle: this.contentSubtitle
        };

        Object.entries(elements).forEach(([name, element]) => {
            if (!element) {
                console.error(`UI Element missing: ${name}`);
            } else {
                console.log(`UI Element found: ${name}`);
            }
        });

        // Security: These buttons may not exist (removed for security)
        this.copyContent = document.getElementById('copyContent');
        this.downloadContent = document.getElementById('downloadContent');

        // Set initial status
        this.updateConnectionStatus('connecting', 'Initializing...', 'System startup in progress');
    }

    async waitForAPI(maxAttempts = 20, delay = 200) {
        for (let i = 0; i < maxAttempts; i++) {
            if (window.api && window.api.test) {
                console.log(`API available after ${i + 1} attempts`);
                this.api = window.api;
                return true;
            }
            console.log(`Attempt ${i + 1}: Waiting for API...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.updateConnectionStatus('error', 'API Unavailable', 'Failed to connect to secure API');
        this.showToast('error', 'System Error', 'Could not establish secure connection to backend');
        return false;
    }

    setupEventListeners() {
        // File input change with better file name display
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                console.log('File selected:', file);

                if (file) {
                    // Update file input text
                    if (this.fileInputText) {
                        this.fileInputText.textContent = file.name;
                        console.log('Updated file input text to:', file.name);
                    }

                    // Add visual indicator that file is selected
                    if (this.fileInputLabel) {
                        this.fileInputLabel.classList.add('has-file');
                    }

                    this.checkFormValidity();
                } else {
                    // Reset to default state
                    if (this.fileInputText) {
                        this.fileInputText.textContent = 'Choose Vault File';
                    }

                    if (this.fileInputLabel) {
                        this.fileInputLabel.classList.remove('has-file');
                    }

                    this.checkFormValidity();
                }
            });
        } else {
            console.error('File input not found');
        }

        // Password input
        this.passwordInput.addEventListener('input', () => {
            this.checkFormValidity();
        });

        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                this.passwordInput.setAttribute('type', type);

                const icon = togglePassword.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }

        // Open button with enhanced error handling
        if (this.openBtn) {
            this.openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Decrypt button clicked');
                this.openSecureFile();
            });
        } else {
            console.error('Open button not found');
        }

        // Security: Remove copy/download buttons and setup content protection
        this.setupContentSecurity();
    }

    checkFormValidity() {
        const hasFile = this.fileInput.files.length > 0;
        const hasPassword = this.passwordInput.value.length > 0;

        this.openBtn.disabled = !(hasFile && hasPassword);
    }

    setupContentSecurity() {
        // Disable right-click context menu on content
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.content-display') || e.target.closest('.content-json')) {
                e.preventDefault();
                e.stopPropagation();
                this.showToast('warning', 'Security Alert', 'Content copying is not allowed');
                return false;
            }
        });

        // Prevent keyboard shortcuts for copying
        document.addEventListener('keydown', (e) => {
            const isContentArea = e.target.closest('.content-display') || e.target.closest('.content-json');
            const isFocusedOnContent = document.activeElement && (
                document.activeElement.closest('.content-display') ||
                document.activeElement.closest('.content-json')
            );

            if (isContentArea || isFocusedOnContent) {
                // Prevent Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, F12, etc.
                if (
                    (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
                    (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
                    (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
                    (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                    (e.key === 'F12') ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
                    (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
                ) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('warning', 'Security Alert', 'This action is not allowed on protected content');
                    return false;
                }
            }
        });

        // Detect window focus/blur for content protection
        window.addEventListener('blur', () => {
            document.body.classList.add('window-blur');
        });

        window.addEventListener('focus', () => {
            document.body.classList.remove('window-blur');
        });

        // Detect potential dev tools opening
        let devtools = { open: false, orientation: null };
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                    devtools.open = true;
                    document.querySelectorAll('.content-json').forEach(el => {
                        el.classList.add('dev-tools-detected');
                    });
                    this.showToast('error', 'Security Alert', 'Developer tools detected - content hidden');
                }
            } else {
                if (devtools.open) {
                    devtools.open = false;
                    document.querySelectorAll('.content-json').forEach(el => {
                        el.classList.remove('dev-tools-detected');
                    });
                }
            }
        }, 500);

        // Disable print functionality
        window.addEventListener('beforeprint', (e) => {
            e.preventDefault();
            this.showToast('error', 'Security Alert', 'Printing is not allowed for security reasons');
            return false;
        });

        // Disable drag and drop of content
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.content-display') || e.target.closest('.content-json')) {
                e.preventDefault();
                return false;
            }
        });

        // Monitor for screenshot attempts (basic detection)
        document.addEventListener('keydown', (e) => {
            // Windows: PrtScn, Alt+PrtScn, Win+PrtScn, Win+Shift+S
            if (e.key === 'PrintScreen' ||
                (e.altKey && e.key === 'PrintScreen') ||
                (e.metaKey && e.key === 'PrintScreen') ||
                (e.metaKey && e.shiftKey && e.key === 'S')) {

                // Temporarily blur content
                document.querySelectorAll('.content-json').forEach(el => {
                    el.style.filter = 'blur(20px)';
                    el.style.opacity = '0.1';
                });

                this.showToast('error', 'Security Alert', 'Screenshot detected - content temporarily hidden');

                // Restore content after a delay
                setTimeout(() => {
                    document.querySelectorAll('.content-json').forEach(el => {
                        el.style.filter = 'blur(0px)';
                        el.style.opacity = '1';
                    });
                }, 2000);
            }
        });
    }

    async autoConnect() {
        this.updateConnectionStatus('connecting', 'Connecting...', 'Establishing secure connection');

        try {
            // Test API
            const apiTest = this.api.test();
            console.log('API Test:', apiTest);

            // Test Supabase connection
            const supabaseResult = await this.api.testSupabase();
            console.log('Supabase Test:', supabaseResult);

            this.updateConnectionStatus('connected', 'Connected', `${supabaseResult.count} documents available`);

            // Load available files
            await this.loadAvailableFiles();

        } catch (error) {
            console.error('Connection failed:', error);
            this.updateConnectionStatus('error', 'Connection Failed', error.message);
            this.showToast('error', 'Connection Failed', 'Could not connect to secure database');
        }
    }

    async loadAvailableFiles() {
        // Show loading state
        this.filesList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h4>Loading Documents...</h4>
                <p>Please wait while we fetch available vault files</p>
            </div>
        `;

        try {
            console.log('Loading available files...');
            const files = await this.api.listSecureFiles();
            console.log('Files loaded:', files);
            this.displayFilesList(files);
        } catch (error) {
            console.error('Failed to load files:', error);
            this.displayFilesError(error.message);
        }
    }

    displayFilesList(files) {
        if (!files || files.length === 0) {
            this.filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h4>No Documents Found</h4>
                    <p>No vault files are currently available</p>
                </div>
            `;
            return;
        }

        this.filesList.innerHTML = files.map(file => `
            <div class="file-item" data-filename="${file.filename}">
                <div class="file-item-icon">
                    <i class="fas fa-file-shield"></i>
                </div>
                <div class="file-item-info">
                    <div class="file-item-name">${file.filename}</div>
                    <div class="file-item-meta">Created: ${new Date(file.created_at).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');

        // Add click listeners to file items
        this.filesList.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.filename;
                this.showToast('info', 'File Selected', `Use file upload to open ${filename}`);
            });
        });
    }

    displayFilesError(message) {
        this.filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Failed to Load</h4>
                <p>Could not retrieve file list: ${message}</p>
            </div>
        `;
    }

    async openSecureFile() {
        const file = this.fileInput.files[0];
        const password = this.passwordInput.value;

        if (!file || !password) {
            this.showToast('warning', 'Missing Information', 'Please select a file and enter password');
            return;
        }

        try {
            // Update button state
            this.openBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Decrypting...</span>';
            this.openBtn.disabled = true;

            // Read file content
            const fileContent = await this.readFileContent(file);

            // Decrypt file
            const decryptedData = await this.api.openSecureFileFromContent(fileContent, file.name, password);

            // Display content
            this.displayContent(decryptedData, file.name);

            this.showToast('success', 'File Decrypted', 'Document has been successfully decrypted');

        } catch (error) {
            console.error('Decryption failed:', error);
            this.showToast('error', 'Decryption Failed', error.message);
            this.displayContentError(error.message);
        } finally {
            // Reset button
            this.openBtn.innerHTML = '<i class="fas fa-unlock"></i><span>Decrypt & Open</span>';
            this.openBtn.disabled = false;
            this.checkFormValidity();
        }
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    displayContent(data, filename) {
        this.contentSubtitle.textContent = `Decrypted content from ${filename}`;

        // Disable console access when displaying sensitive content
        if (window.disableConsole) {
            window.disableConsole();
        }

        // Create secure content display without copy/download options
        this.contentDisplay.innerHTML = `
            <div class="content-json" id="secureContent">${JSON.stringify(data, null, 2)}</div>
        `;

        // Hide action buttons for security (only if they exist)
        if (this.copyContent) {
            this.copyContent.style.display = 'none';
        }
        if (this.downloadContent) {
            this.downloadContent.style.display = 'none';
        }

        // Apply additional security measures to the content
        const secureContent = document.getElementById('secureContent');
        if (secureContent) {
            // Make content completely unselectable
            secureContent.style.webkitUserSelect = 'none';
            secureContent.style.mozUserSelect = 'none';
            secureContent.style.msUserSelect = 'none';
            secureContent.style.userSelect = 'none';
            secureContent.style.webkitTouchCallout = 'none';
            secureContent.style.webkitTapHighlightColor = 'transparent';
            secureContent.style.pointerEvents = 'none';

            // Prevent any form of interaction
            secureContent.setAttribute('unselectable', 'on');
            secureContent.setAttribute('onselectstart', 'return false;');
            secureContent.setAttribute('onmousedown', 'return false;');

            // Security: Make content inaccessible via DOM inspection
            try {
                Object.defineProperty(secureContent, 'textContent', {
                    configurable: false,
                    enumerable: false,
                    get: () => '[PROTECTED CONTENT]',
                    set: () => { }
                });

                Object.defineProperty(secureContent, 'innerHTML', {
                    configurable: false,
                    enumerable: false,
                    get: () => '[PROTECTED CONTENT]',
                    set: () => { }
                });
            } catch (e) {
                // Ignore if property definition fails
                console.log('Property protection setup complete');
            }
        }

        // Store reference but don't allow external access
        this.currentContent = null; // Security: Don't store content
        this.currentFilename = filename;

        this.showToast('info', 'Security Notice', 'Content is protected - copying and downloading disabled');
    }

    displayContentError(message) {
        this.contentDisplay.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Decryption Failed</h4>
                <p>${message}</p>
            </div>
        `;

        // Hide action buttons (only if they exist)
        if (this.copyContent) {
            this.copyContent.style.display = 'none';
        }
        if (this.downloadContent) {
            this.downloadContent.style.display = 'none';
        }
    }

    // Security: Removed copyToClipboard and downloadContent methods
    // These functions are no longer available for security reasons

    updateConnectionStatus(state, text, info) {
        this.statusIcon.className = 'fas fa-circle';
        this.statusText.textContent = text;
        this.connectionInfo.textContent = info;

        // Remove all status classes
        this.statusBar.querySelector('.status-indicator').classList.remove('connected', 'connecting', 'error');

        // Add current status class
        this.statusBar.querySelector('.status-indicator').classList.add(state);
    }

    showToast(type, title, message) {
        const toastContainer = document.getElementById('toastContainer');

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize the application
const policyVault = new PolicyVault();
