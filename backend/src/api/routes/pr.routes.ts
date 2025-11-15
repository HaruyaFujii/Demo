import { Router, } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GithubService } from '../../services/github.service.js';
import type { CheckPRRequest, EvaluateCodeRequest } from '../../schemas/request.js';
import type { CheckPRResponse } from '../../schemas/response.js';
import { GeminiService } from '../../services/gemini.service.js';
import { SupabaseService } from '../../services/supabase.service.js';
import type { CodeEvaluationResponse } from '../../schemas/response.js';

const router = Router();
const githubService = new GithubService();
const geminiService = new GeminiService();
const supabaseService = new SupabaseService();

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
      
      // データベースにCIスコアを保存
      const submission = await supabaseService.findSubmissionByPrUrl(prUrl);
      if (submission) {
        await supabaseService.updateSubmissionScores({
          submissionId: submission.id,
          ciScore: result.ciPassed,
        });
      }
      
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
      const evaluation = await geminiService.evaluateCode(diffs);

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

      // データベースにAIスコアと詳細を保存
      const submission = await supabaseService.findSubmissionByPrUrl(prUrl);
      if (submission) {
        await supabaseService.updateSubmissionScores({
          submissionId: submission.id,
          aiScore: evaluation.overallScore,
          aiEvaluationDetails: {
            scores: evaluation.scores,
            feedback: evaluation.feedback,
          },
        });
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;