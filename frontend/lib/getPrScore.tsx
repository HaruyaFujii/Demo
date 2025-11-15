// src/lib/getPrScore.ts (パスは任意)
export async function getPrScore(prUrl: string): Promise<number> {
  const res = await fetch('http://localhost:3001/api/score-pr', {
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

  const data: { score: number } = await res.json();
  return data.score;
}
