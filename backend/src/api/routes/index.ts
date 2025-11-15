// src/api/routes/index.ts
import { Router } from 'express';
import prRoutes from './pr.routes.js';

const router = Router();

// PRルート（CI チェック & コード評価）
router.use('/api/pr', prRoutes);

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

export default router;