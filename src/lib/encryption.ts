import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const SECRET_KEY = process.env.BETTER_AUTH_SECRET;
if (!SECRET_KEY) {
  throw new Error("BETTER_AUTH_SECRET is not defined");
}

// Derive a 32-byte key from your secret
const key = scryptSync(SECRET_KEY, "salt", 32);
const algorithm = "aes-256-gcm";

export async function encryptToken(token: string): Promise<string> {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted all together
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    const [iv, authTag, encrypted] = encryptedToken.split(":");

    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt token:", error);
    throw new Error("Token decryption failed");
  }
}
