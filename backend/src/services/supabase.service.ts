import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from '../core/config.js';
import { AppError } from '../core/exceptions.js';

interface SubmissionScores {
  submissionId: string;
  ciScore?: number;
  aiScore?: number;
  aiEvaluationDetails?: {
    scores: {
      readability: number;
      maintainability: number;
      robustness: number;
      performance: number;
      security: number;
    };
    feedback: {
      strengths: string[];
      improvements: string[];
      criticalIssues: string[];
    };
  };
}

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey
    );
  }

  async updateSubmissionScores(data: SubmissionScores): Promise<void> {
    try {
      const updateData: any = {};
      
      if (data.ciScore !== undefined) {
        updateData.ci_score = data.ciScore;
      }
      
      if (data.aiScore !== undefined) {
        updateData.ai_score = data.aiScore;
      }
      
      if (data.aiEvaluationDetails !== undefined) {
        updateData.ai_evaluation_details = data.aiEvaluationDetails;
      }

      const { error } = await this.supabase
        .from('submissions')
        .update(updateData)
        .eq('id', data.submissionId);

      if (error) {
        throw new AppError(500, `Failed to update submission scores: ${error.message}`);
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Failed to update submission scores: ${error.message}`);
    }
  }

  async findSubmissionByPrUrl(prUrl: string): Promise<{ id: string } | null> {
    try {
      const { data, error } = await this.supabase
        .from('submissions')
        .select('id')
        .eq('pr_url', prUrl)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw new AppError(500, `Failed to find submission: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Failed to find submission: ${error.message}`);
    }
  }
}
