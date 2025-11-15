import { Octokit } from '@octokit/rest';
import { config } from '../core/config.js';
import { AppError } from '../core/exceptions.js';
import type { CheckPRResponse } from '../schemas/response.js';

export class GithubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({ auth: config.githubToken });
  }

  // PRのURLをパース
  private parsePRUrl(prUrl: string): { owner: string; repo: string; prNumber: number } {
    // https://github.com/owner/repo/pull/123
    const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw new AppError(400, 'Invalid PR URL format');
    }

    return {
      owner: match[1],
      repo: match[2],
      prNumber: parseInt(match[3], 10)
    };
  }

  async checkPRCI(prUrl: string): Promise<CheckPRResponse> {
    try {
      const { owner, repo, prNumber } = this.parsePRUrl(prUrl);

      // PRの情報を取得
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      // CI結果を取得
      const { data: checks } = await this.octokit.checks.listForRef({
        owner,
        repo,
        ref: pr.head.sha
      });

      const total = checks.total_count;
      const passed = checks.check_runs.filter(c => c.conclusion === 'success').length;
      const allCompleted = checks.check_runs.every(c => c.status === 'completed');

      return {
        prUrl,
        prNumber,
        ciPassed: passed,
        ciTotal: total,
        ciState: allCompleted 
          ? (passed === total ? 'success' : 'failure') 
          : 'pending'
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Failed to check PR: ${error.message}`);
    }
  }
}