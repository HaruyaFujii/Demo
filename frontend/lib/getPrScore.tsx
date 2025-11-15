export async function getPrScore(prUrl: string): Promise<number> {
  const res = await fetch('http://localhost:3001/api/pr/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prUrl }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get score: ${res.status} ${text}`);
  }

  const data: {
    prUrl: string;
    prNumber: number;
    ciPassed: number;
    ciTotal: number;
    ciState: 'success' | 'failure' | 'pending';
  } = await res.json();
  
  // スコアを計算 (ciPassed / ciTotal * 100)
  const score = data.ciTotal > 0 ? Math.round((data.ciPassed / data.ciTotal) * 100) : 0;
  return score;
}
