// src/api/routes/index.ts
import { Router } from 'express';
import prRoutes from './github.routes.js';

const router = Router();

router.use('/api/pr', prRoutes);

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;