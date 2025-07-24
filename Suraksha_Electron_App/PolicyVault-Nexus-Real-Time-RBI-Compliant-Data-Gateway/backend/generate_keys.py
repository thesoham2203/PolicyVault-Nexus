from Crypto.PublicKey import RSA
import os

# Generate RSA key pair
key = RSA.generate(2048)

# Create keys directory if it doesn't exist
os.makedirs("app/keys", exist_ok=True)

# Save private key
private_key = key.export_key()
with open("app/keys/vault_private.pem", "wb") as f:
    f.write(private_key)

# Save public key
public_key = key.publickey().export_key()
with open("app/keys/vault_public.pem", "wb") as f:
    f.write(public_key)

print("RSA key pair generated successfully!")
print("Private key saved to: app/keys/vault_private.pem")
print("Public key saved to: app/keys/vault_public.pem")
