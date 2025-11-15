import { Router, } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GithubService } from '../../services/github.service.js';
import type { CheckPRRequest, EvaluateCodeRequest } from '../../schemas/request.js';
import type { CheckPRResponse } from '../../schemas/response.js';
import { GeminiService } from '../../services/gemini.service.js'; // 変更
import type { CodeEvaluationResponse } from '../../schemas/response.js';

const router = Router();
const githubService = new GithubService();
const geminiService = new GeminiService(); // 変更

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

// コード品質評価エンドポイント
router.post(
  '/evaluate',
  async (req: Request<{}, CodeEvaluationResponse, EvaluateCodeRequest>, res: Response, next: NextFunction) => {
    try {
      const { prUrl } = req.body;
      
      if (!prUrl) {
        return res.status(400).json({ error: 'prUrl is required' } as any);
      }

      // PRの差分を取得
      const { diffs, filesAnalyzed, linesChanged } = await githubService.getPRDiff(prUrl);

      if (diffs.length === 0) {
        return res.status(400).json({ 
          error: 'No code changes found in this PR' 
        } as any);
      }

      // Gemini AIでコード評価
      const evaluation = await geminiService.evaluateCode(diffs); // 変更

      const { owner, repo, prNumber } = (githubService as any).parsePRUrl(prUrl);

      const response: CodeEvaluationResponse = {
        prUrl,
        prNumber,
        overallScore: evaluation.overallScore,
        scores: evaluation.scores,
        feedback: evaluation.feedback,
        filesAnalyzed,
        linesChanged,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;