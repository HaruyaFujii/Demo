// src/app.ts
import express from 'express';
import cors from 'cors';
import { config } from './core/config.js';
import routes from './api/routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;