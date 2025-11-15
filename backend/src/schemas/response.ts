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