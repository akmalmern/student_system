import fs from 'fs';
import path from 'path';
import type { Request } from 'express';

/**
 * 📁 Upload papkani tekshiradi,
 * yo‘q bo‘lsa avtomatik yaratadi.
 */
export function ensureUploadsDir(): string {
  const dir = process.env.UPLOAD_DIR ?? 'uploads';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

/**
 * 🖼️ Faqat rasm formatlariga ruxsat beriladi.
 */
export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (err: Error | null, accept: boolean) => void,
): void {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowed.includes(file.mimetype)) {
    cb(new Error('Faqat jpg/png/webp rasm yuklash mumkin'), false);
    return;
  }

  cb(null, true);
}

/**
 * 🏷️ Fayl nomini xavfsiz va unik qilish
 */
export function generateImageFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = `avatar_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  return `${base}${ext}`;
}
