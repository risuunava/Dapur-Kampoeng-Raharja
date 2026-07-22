import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';

const router: ReturnType<typeof Router> = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file JPEG, PNG, atau WebP yang diizinkan'));
    }
  },
});

router.post(
  '/menu',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'File gambar tidak ditemukan' });
      }

      const ext = file.originalname.split('.').pop() || 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filepath = `menu/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filepath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        return res.status(500).json({ error: `Gagal upload: ${uploadError.message}` });
      }

      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filepath);

      res.json({ data: { url: urlData.publicUrl } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'unknown error';
      res.status(500).json({ error: message });
    }
  }
);

export default router;
