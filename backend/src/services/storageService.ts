import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const STORAGE_PATH = process.env.STORAGE_PATH || "./uploads";

export function ensureStorageDirectory(): void {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }
}

export async function saveBase64Image(base64Data: string, prefix = "evidence"): Promise<string> {
  ensureStorageDirectory();

  const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const data = matches && matches.length === 3 ? matches[2] : base64Data;
  const extension = matches && matches[1].includes("png") ? "png" : "jpg";

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const filePath = path.join(STORAGE_PATH, filename);

  await fs.promises.writeFile(filePath, Buffer.from(data, "base64"));
  logger.info(`Saved image artifact to ${filePath}`);

  return `/uploads/${filename}`;
}
