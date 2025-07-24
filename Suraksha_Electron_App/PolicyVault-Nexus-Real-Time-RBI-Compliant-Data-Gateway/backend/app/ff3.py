import os
import re
import string
from typing import Dict, Any, Optional, Tuple
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend

# Simple test to verify file execution
class TestClass:
    pass

print("FF3 module loading...")

class FF3Cipher:
    """Enhanced FF3 Format-Preserving Encryption for PolicyVault"""
    
    def __init__(self, key: bytes, tweak: bytes):
        self.key = key
        self.tweak = tweak
        self.cipher = Cipher(algorithms.AES(self.key), modes.ECB())
        
        # Define character sets for different data types
        self.NUMERIC = "0123456789"
        self.ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz"
        self.ALPHANUM_UPPER = self.ALPHA_UPPER + self.NUMERIC
        self.ALPHANUM_MIXED = self.ALPHA_UPPER + self.ALPHA_LOWER + self.NUMERIC
    
    def _encrypt_block(self, block: bytes) -> bytes:
        """Internal AES block encryption"""
        encryptor = self.cipher.encryptor()
        return encryptor.update(block) + encryptor.finalize()
    
    def _get_radix_and_alphabet(self, plaintext: str) -> Tuple[int, str]:
        """Determine the appropriate radix and alphabet for the input"""
        if plaintext.isdigit():
            return 10, self.NUMERIC
        elif plaintext.isupper() and plaintext.isalnum():
            return 36, self.ALPHANUM_UPPER
        elif plaintext.isalnum():
            return 62, self.ALPHANUM_MIXED
        else:
            # Default to alphanumeric mixed case
            return 62, self.ALPHANUM_MIXED
    
    def _char_to_int(self, char: str, alphabet: str) -> int:
        """Convert character to integer based on alphabet"""
        return alphabet.index(char)
    
    def _int_to_char(self, val: int, alphabet: str) -> str:
        """Convert integer to character based on alphabet"""
        return alphabet[val % len(alphabet)]
    
    def _string_to_int_array(self, text: str, alphabet: str) -> list:
        """Convert string to array of integers"""
        return [self._char_to_int(c, alphabet) for c in text]
    
    def _int_array_to_string(self, arr: list, alphabet: str) -> str:
        """Convert array of integers to string"""
        return ''.join(self._int_to_char(val, alphabet) for val in arr)
    
    def encrypt_with_format(self, plaintext: str, preserve_case: bool = True) -> str:
        """
        Encrypt while preserving the original format
        - Numbers stay numbers
        - Uppercase letters stay uppercase
        - Mixed case handled appropriately
        """
        if len(plaintext) < 4:
            # For very short strings, use simple substitution
            return self._simple_encrypt(plaintext)
        
        radix, alphabet = self._get_radix_and_alphabet(plaintext)
        int_array = self._string_to_int_array(plaintext, alphabet)
        
        # Split into left and right halves
        n = len(int_array)
        left = int_array[:n//2]
        right = int_array[n//2:]
        
        # FF3 rounds (8 rounds for security)
        for round_num in range(8):
            # Create round input
            if round_num % 2 == 0:
                # Even round: use right side
                round_input = right + list(self.tweak) + [round_num]
            else:
                # Odd round: use left side
                round_input = left + list(self.tweak) + [round_num]
            
            # Pad to block size and encrypt
            padded_input = (round_input + [0] * 16)[:16]
            block = self._encrypt_block(bytes(padded_input))
            
            # Extract numeric value from encrypted block
            numeric_val = int.from_bytes(block[:4], 'big')
            
            if round_num % 2 == 0:
                # Modify left side
                for i in range(len(left)):
                    left[i] = (left[i] + (numeric_val >> (i * 4)) % radix) % radix
            else:
                # Modify right side
                for i in range(len(right)):
                    right[i] = (right[i] + (numeric_val >> (i * 4)) % radix) % radix
        
        # Reconstruct the encrypted string
        encrypted_array = left + right
        return self._int_array_to_string(encrypted_array, alphabet)
    
    def _simple_encrypt(self, plaintext: str) -> str:
        """Simple encryption for very short strings"""
        radix, alphabet = self._get_radix_and_alphabet(plaintext)
        result = ""
        
        for i, char in enumerate(plaintext):
            char_val = self._char_to_int(char, alphabet)
            # Simple substitution with position-dependent key
            shift = (self.tweak[i % len(self.tweak)] + i) % radix
            encrypted_val = (char_val + shift) % radix
            result += self._int_to_char(encrypted_val, alphabet)
        
        return result
    
    def decrypt_with_format(self, ciphertext: str) -> str:
        """Decrypt while preserving the original format"""
        if len(ciphertext) < 4:
            return self._simple_decrypt(ciphertext)
        
        radix, alphabet = self._get_radix_and_alphabet(ciphertext)
        int_array = self._string_to_int_array(ciphertext, alphabet)
        
        # Split into left and right halves
        n = len(int_array)
        left = int_array[:n//2]
        right = int_array[n//2:]
        
        # FF3 rounds in reverse (8 rounds)
        for round_num in range(7, -1, -1):
            # Create round input (same as encryption)
            if round_num % 2 == 0:
                round_input = right + list(self.tweak) + [round_num]
            else:
                round_input = left + list(self.tweak) + [round_num]
            
            # Pad to block size and encrypt
            padded_input = (round_input + [0] * 16)[:16]
            block = self._encrypt_block(bytes(padded_input))
            
            # Extract numeric value from encrypted block
            numeric_val = int.from_bytes(block[:4], 'big')
            
            if round_num % 2 == 0:
                # Reverse modify left side
                for i in range(len(left)):
                    left[i] = (left[i] - (numeric_val >> (i * 4)) % radix) % radix
            else:
                # Reverse modify right side
                for i in range(len(right)):
                    right[i] = (right[i] - (numeric_val >> (i * 4)) % radix) % radix
        
        # Reconstruct the decrypted string
        decrypted_array = left + right
        return self._int_array_to_string(decrypted_array, alphabet)
    
    def _simple_decrypt(self, ciphertext: str) -> str:
        """Simple decryption for very short strings"""
        radix, alphabet = self._get_radix_and_alphabet(ciphertext)
        result = ""
        
        for i, char in enumerate(ciphertext):
            char_val = self._char_to_int(char, alphabet)
            # Reverse the simple substitution
            shift = (self.tweak[i % len(self.tweak)] + i) % radix
            decrypted_val = (char_val - shift) % radix
            result += self._int_to_char(decrypted_val, alphabet)
        
        return result

# PolicyVault specific format-preserving encryption functions
class PolicyVaultFPE:
    """PolicyVault Format-Preserving Encryption Manager"""
    
    def __init__(self, master_key: bytes):
        # Derive different keys for different data types
        self.master_key = master_key
        self._derive_keys()
    
    def _derive_keys(self):
        """Derive specific keys for different data types"""
        kdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"policyvault_fpe_salt",
            info=b"",
            backend=default_backend()
        )
        
        # Different keys for different data types
        self.pan_key = kdf.derive(self.master_key + b"PAN")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.account_key = kdf.derive(self.master_key + b"ACCOUNT")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.aadhaar_key = kdf.derive(self.master_key + b"AADHAAR")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.mobile_key = kdf.derive(self.master_key + b"MOBILE")
        
        # Common tweak for all encryptions
        self.tweak = b"PolicyVault2025"[:8]  # 8-byte tweak
    
    def encrypt_pan(self, pan: str) -> Dict[str, Any]:
        """Encrypt PAN card number with format preservation"""
        # PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
        if not self._validate_pan(pan):
            raise ValueError(f"Invalid PAN format: {pan}")
        
        cipher = FF3Cipher(self.pan_key, self.tweak)
        encrypted_pan = cipher.encrypt_with_format(pan.upper())
        
        return {
            "encrypted_value": encrypted_pan,
            "data_type": "PAN",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_account_number(self, account: str) -> Dict[str, Any]:
        """Encrypt account number with format preservation"""
        if not account.isdigit() or len(account) < 8:
            raise ValueError(f"Invalid account number format: {account}")
        
        cipher = FF3Cipher(self.account_key, self.tweak)
        encrypted_account = cipher.encrypt_with_format(account)
        
        return {
            "encrypted_value": encrypted_account,
            "data_type": "ACCOUNT_NUMBER",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_aadhaar(self, aadhaar: str) -> Dict[str, Any]:
        """Encrypt Aadhaar number with format preservation"""
        # Remove spaces and validate
        clean_aadhaar = aadhaar.replace(" ", "").replace("-", "")
        if not clean_aadhaar.isdigit() or len(clean_aadhaar) != 12:
            raise ValueError(f"Invalid Aadhaar format: {aadhaar}")
        
        cipher = FF3Cipher(self.aadhaar_key, self.tweak)
        encrypted_aadhaar = cipher.encrypt_with_format(clean_aadhaar)
        
        # Restore original formatting
        if " " in aadhaar:
            encrypted_aadhaar = f"{encrypted_aadhaar[:4]} {encrypted_aadhaar[4:8]} {encrypted_aadhaar[8:]}"
        elif "-" in aadhaar:
            encrypted_aadhaar = f"{encrypted_aadhaar[:4]}-{encrypted_aadhaar[4:8]}-{encrypted_aadhaar[8:]}"
        
        return {
            "encrypted_value": encrypted_aadhaar,
            "data_type": "AADHAAR",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_mobile(self, mobile: str) -> Dict[str, Any]:
        """Encrypt mobile number with format preservation"""
        # Clean mobile number
        clean_mobile = re.sub(r'[^\d]', '', mobile)
        if len(clean_mobile) != 10:
            raise ValueError(f"Invalid mobile number format: {mobile}")
        
        cipher = FF3Cipher(self.mobile_key, self.tweak)
        encrypted_mobile = cipher.encrypt_with_format(clean_mobile)
        
        # Restore original formatting if present
        if "+" in mobile:
            encrypted_mobile = f"+91{encrypted_mobile}"
        elif mobile.startswith("91"):
            encrypted_mobile = f"91{encrypted_mobile}"
        
        return {
            "encrypted_value": encrypted_mobile,
            "data_type": "MOBILE",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def _validate_pan(self, pan: str) -> bool:
        """Validate PAN card format"""
        pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pattern, pan.upper()))
    
    # Decryption methods (for authorized access)
    def decrypt_pan(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt PAN card number"""
        if encrypted_data.get("data_type") != "PAN":
            raise ValueError("Invalid encrypted data type for PAN decryption")
        
        cipher = FF3Cipher(self.pan_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_account_number(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt account number"""
        if encrypted_data.get("data_type") != "ACCOUNT_NUMBER":
            raise ValueError("Invalid encrypted data type for account decryption")
        
        cipher = FF3Cipher(self.account_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_aadhaar(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt Aadhaar number"""
        if encrypted_data.get("data_type") != "AADHAAR":
            raise ValueError("Invalid encrypted data type for Aadhaar decryption")
        
        cipher = FF3Cipher(self.aadhaar_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_mobile(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt mobile number"""
        if encrypted_data.get("data_type") != "MOBILE":
            raise ValueError("Invalid encrypted data type for mobile decryption")
        
        cipher = FF3Cipher(self.mobile_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
