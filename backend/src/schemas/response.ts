// export interface HealthCheckResponse {
//   status: 'ok';
//   timestamp: string;
// }

// export interface InviteUserResponse {
//   success: boolean;
//   message: string;
// }

// export interface Result {
//     ciPassed: number;
//     ciTotal: number;
//     ciState: 'success' | 'failure' | 'pending';
// }

// export interface PRWithCIResponse {
//   username: string;
//   prNumber: number;
//   prTitle: string;
//   result: Result;
//   createdAt: string;
// }

// export interface ErrorResponse {
//   error: string;
// }

// src/schemas/response.ts
export interface CheckPRResponse {
  prUrl: string;
  prNumber: number;
  ciPassed: number;
  ciTotal: number;
  ciState: 'success' | 'failure' | 'pending';
};

export interface CodeEvaluationResponse {
  prUrl: string;
  prNumber: number;
  overallScore: number;  // 0-100
  scores: {
    readability: number;    // 0-30
    maintainability: number; // 0-25
    robustness: number;     // 0-25
    performance: number;    // 0-10
    security: number;       // 0-10
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    criticalIssues: string[];
  };
  filesAnalyzed: number;
  linesChanged: number;
}