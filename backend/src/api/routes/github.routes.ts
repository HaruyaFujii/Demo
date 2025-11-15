import { Router, } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GithubService } from '../../services/github.service.js';
import type { CheckPRRequest } from '../../schemas/request.js';
import type { CheckPRResponse } from '../../schemas/response.js';

const router = Router();
const githubService = new GithubService();

// PRのCI結果をチェック
router.post(
  '/check',
  async (req: Request<{}, CheckPRResponse, CheckPRRequest>, res: Response, next: NextFunction) => {
    try {
      const { prUrl } = req.body;
      
      if (!prUrl) {
        return res.status(400).json({ error: 'prUrl is required' } as any);
      }
      
      const result = await githubService.checkPRCI(prUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;