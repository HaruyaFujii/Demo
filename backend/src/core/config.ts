// import dotenv from 'dotenv'
// dotenv.config();

// export const config = {
//     port: process.env.PORT || 3001,
//     frontendUrl: process.env.FRONT_URL || 'http://localhost:3000',
//     github: {
//         token: process.env.GITHUB_API_TOKEN!,
//         owner: process.env.GITHUB_OWNER!,
//         repo: process.env.GITHUB_REPO!,
//     },
//     supabase: {
//         url: process.env
//     }
// }

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  githubToken: process.env.GITHUB_TOKEN!,
  geminiApiKey: process.env.GEMINI_API_KEY!,
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
};