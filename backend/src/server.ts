// src/app.ts
import express from 'express';
import cors from 'cors';
import { config } from './core/config.js';
import routes from './api/routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ミドルウェア
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

// ルート
app.use(routes);

// エラーハンドリング（最後に配置）
app.use(errorHandler);

// サーバー起動
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Frontend URL: ${config.frontendUrl}`);
});

export default app;