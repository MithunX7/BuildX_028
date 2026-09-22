import fs from "fs";
import path from "path";
import { logger } from "./logger";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveBase64Image(base64Data: string, prefix = "frame"): Promise<string> {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "jpg";

    if (matches && matches.length === 3) {
      ext = matches[1].split("/")[1] || "jpg";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    logger.error("Failed to save base64 image", err);
    // Fallback placeholder
    return `/uploads/sample_${prefix}.jpg`;
  }
}
