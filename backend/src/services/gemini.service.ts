import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../core/config.js';
import { AppError } from '../core/exceptions.js';

interface CodeDiff {
  filename: string;
  additions: number;
  deletions: number;
  patch: string;
}

interface EvaluationResult {
  overallScore: number;
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
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  async evaluateCode(diffs: CodeDiff[]): Promise<EvaluationResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = this.buildEvaluationPrompt(diffs);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      return this.parseEvaluation(responseText);
    } catch (error: any) {
      throw new AppError(500, `AI evaluation failed: ${error.message}`);
    }
  }

  private buildEvaluationPrompt(diffs: CodeDiff[]): string {
    const diffText = diffs
      .map(
        (diff) => `
### File: ${diff.filename}
Additions: ${diff.additions} | Deletions: ${diff.deletions}

\`\`\`diff
${diff.patch}
\`\`\`
`
      )
      .join('\n');

    return `あなたはコードレビューの専門家です。以下のプルリクエストのコード差分を評価してください。

# コード差分
${diffText}

# 評価基準
以下の5つの観点から評価し、各項目のスコアと総合評価を提供してください：

1. **可読性 (0-30点)**
   - 変数名・関数名の明確さ
   - コメントの適切さ
   - コード構造の理解しやすさ
   - 一貫性のあるスタイル

2. **保守性 (0-25点)**
   - コードの重複（DRY原則）
   - 関数の適切な長さと複雑度
   - モジュール化・責任分離
   - 拡張性

3. **堅牢性 (0-25点)**
   - エラーハンドリングの適切さ
   - 型安全性の確保
   - エッジケースへの対応
   - バリデーションの実装

4. **パフォーマンス (0-10点)**
   - アルゴリズムの効率性
   - 不要な処理の有無
   - リソース使用の最適化

5. **セキュリティ (0-10点)**
   - 脆弱性の有無
   - 入力検証の適切さ
   - 機密情報の適切な扱い

# 重要な指示
- 厳密に評価してください。完璧なコードでない限り満点は与えず、実際の問題点を具体的に指摘してください
- 回答は必ず以下のJSON形式のみで返してください
- JSON以外のテキスト（説明文やマークダウンのコードブロック記号など）は一切含めないでください

{
  "scores": {
    "readability": <0-30の数値>,
    "maintainability": <0-25の数値>,
    "robustness": <0-25の数値>,
    "performance": <0-10の数値>,
    "security": <0-10の数値>
  },
  "feedback": {
    "strengths": ["良い点1", "良い点2"],
    "improvements": ["改善点1", "改善点2"],
    "criticalIssues": ["重大な問題1", "重大な問題2"]
  }
}`;
  }

  private parseEvaluation(response: string): EvaluationResult {
    try {
      // JSONブロックを抽出（```json や ``` で囲まれている場合）
      let jsonText = response.trim();
      
      // マークダウンのコードブロックを削除
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 前後の余分なテキストを削除してJSONのみ抽出
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      // スコアの合計を計算
      const overallScore =
        parsed.scores.readability +
        parsed.scores.maintainability +
        parsed.scores.robustness +
        parsed.scores.performance +
        parsed.scores.security;

      return {
        overallScore,
        scores: parsed.scores,
        feedback: {
          strengths: parsed.feedback.strengths || [],
          improvements: parsed.feedback.improvements || [],
          criticalIssues: parsed.feedback.criticalIssues || [],
        },
      };
    } catch (error: any) {
      console.error('Parse error:', error);
      console.error('Response:', response);
      throw new AppError(500, `Failed to parse evaluation: ${error.message}`);
    }
  }
}