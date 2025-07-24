// frontend/app.js

// Load RSA Public Key from PolicyVault
async function fetchPublicKey() {
    try {
        console.log("🔍 Attempting to fetch public key from /e2ee/public-key");
        const response = await fetch("/e2ee/public-key");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        console.log("🔓 Public Key PEM (Raw):", text);

        const pem = text
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace(/\s+/g, "");

        const binaryDer = str2ab(atob(pem));
        const key = await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["encrypt"]
        );

        // SHA-256 fingerprint of imported key
        const hashBuffer = await crypto.subtle.digest("SHA-256", binaryDer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log("🔐 [Frontend Public Key SHA-256]:", hashHex);

        return key;
    } catch (error) {
        console.error("❌ Error fetching public key:", error);
        throw new Error(`Failed to fetch public key: ${error.message}`);
    }
}

// Generate AES-GCM session key
async function generateSessionKey() {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt payload with AES-GCM
async function encryptPayload(data, aesKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoded
    );
    const tag = new Uint8Array(ciphertext).slice(-16); // AES-GCM tag (last 16 bytes)
    return {
        iv: arrayBufferToHex(iv),
        ciphertext: arrayBufferToHex(ciphertext),
        tag: arrayBufferToHex(tag)
    };
}

// Encrypt AES session key with RSA-OAEP
async function encryptSessionKey(key, rsaPubKey) {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const encryptedKey = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaPubKey,
        rawKey
    );
    return btoa(String.fromCharCode(...new Uint8Array(encryptedKey))); // base64
}

// Convert string to ArrayBuffer
function str2ab(str) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf.buffer;
}

// Convert ArrayBuffer to Hex
function arrayBufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}

// Handle Submit securely
async function handleSecureSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log("🔐 Form submission started");

    // Prevent multiple submissions
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton.disabled) {
        console.log("⚠️ Form already being submitted, ignoring duplicate");
        return;
    }

    // Disable submit button during processing
    submitButton.disabled = true;
    submitButton.textContent = "🔄 Processing...";

    // Show processing status
    if (window.showStatus) {
        window.showStatus("processing", "🔐 Encrypting and uploading data...");
    }

    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
        console.log("🔑 Fetching public key...");
        const rsaPubKey = await fetchPublicKey();
        console.log("✅ Public key fetched successfully");

        console.log("🔐 Generating session key...");
        const aesKey = await generateSessionKey();
        console.log("✅ Session key generated");

        console.log("📦 Encrypting payload...", data);
        const { iv, ciphertext } = await encryptPayload(data, aesKey);
        console.log("✅ Payload encrypted");

        console.log("🔑 Encrypting session key...");
        const encryptedKey = await encryptSessionKey(aesKey, rsaPubKey);
        console.log("✅ Session key encrypted");

        if (window.showStatus) {
            window.showStatus("processing", "📤 Uploading encrypted data...");
        }

        const requestPayload = {
            encrypted_data: JSON.stringify({
                encrypted_session_key: encryptedKey,
                iv,
                ciphertext
            }),
            session_id: `session_${Date.now()}`,
            metadata: {
                fiu_type: data.fiu,
                timestamp: new Date().toISOString(),
                client_version: "1.0.0"
            }
        };

        console.log("📤 Sending request payload structure:", {
            encrypted_data: "JSON string with E2EE data",
            session_id: requestPayload.session_id,
            metadata: requestPayload.metadata
        });

        const response = await fetch("/secure/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Server error response:", errorText);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("✅ Vault created successfully:", responseData);

        // Show success status
        if (window.showStatus) {
            window.showStatus("success", `✅ Vault created successfully: ${responseData.filename}`);
        }

        // Show uploaded file information
        if (window.showUploadedFileInfo) {
            window.showUploadedFileInfo(responseData.filename, responseData.password);
        }

        // Show the password alert
        alert(`🔐 Vault File Created Successfully!\n\nFilename: ${responseData.filename}\nPassword: ${responseData.password}\n\n⚠️ IMPORTANT: Save this password securely! You'll need it to decrypt the vault file.`);

        // Auto-download the vault file
        try {
            if (window.showStatus) {
                window.showStatus("processing", "📥 Downloading vault file...");
            }

            const downloadResponse = await fetch(`/vault/${responseData.filename}`);

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = responseData.filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                console.log("✅ File downloaded successfully");

                if (window.showStatus) {
                    window.showStatus("success", `✅ ${responseData.filename} downloaded successfully!`);
                }
            } else {
                throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
            }
        } catch (downloadError) {
            console.error("❌ Download error:", downloadError);
            if (window.showStatus) {
                window.showStatus("error", `❌ Download failed: ${downloadError.message}`);
            }
        }

        // Clear the form
        form.reset();

        // Refresh the documents list
        if (window.loadDocuments) {
            setTimeout(() => window.loadDocuments(), 1000);
        }

    } catch (err) {
        console.error("⚠️ Encryption or network error:", err);
        console.error("Error details:", err.message, err.stack);

        if (window.showStatus) {
            window.showStatus("error", `❌ Upload failed: ${err.message}`);
        } else {
            alert(`⚠️ Encryption or upload error!\n\nError: ${err.message}\n\nCheck the console for more details.`);
        }
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = "🔒 Encrypt & Create Vault";
        console.log("🔐 Form submission completed");
    }
}

// Attach event listener when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    console.log("✅ App.js DOM loaded");

    const form = document.getElementById("secureForm");
    if (form) {
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Add the event listener to the new form
        newForm.addEventListener("submit", handleSecureSubmit);
        console.log("✅ Form event listener attached (duplicate-safe)");
    } else {
        console.error("❌ Form element not found");
    }
});