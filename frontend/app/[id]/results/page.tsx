"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

// サンプルデータ（消さない）
const submittedPRs = [
  { id: 1, submitter: "田中太郎", email: "tanaka@example.com", prLink: "https://github.com/example/repo/pull/123", submittedAt: "2025-11-15 11:30", score: 95 },
  { id: 2, submitter: "佐藤花子", email: "sato@example.com", prLink: "https://github.com/example/repo/pull/124", submittedAt: "2025-11-15 11:15", score: 95 },
  { id: 3, submitter: "鈴木一郎", email: "suzuki@example.com", prLink: "https://github.com/example/repo/pull/125", submittedAt: "2025-11-15 13:45", score: 76 },
  { id: 4, submitter: "高橋美咲", email: "takahashi@example.com", prLink: "https://github.com/example/repo/pull/126", submittedAt: "2025-11-15 14:20", score: 82 },
  { id: 5, submitter: "伊藤健太", email: "ito@example.com", prLink: "https://github.com/example/repo/pull/127", submittedAt: "2025-11-15 15:00", score: 91 },
];

// スコア高い順、同点の場合は提出日時が早い順
submittedPRs.sort((a, b) => {
  if (b.score === a.score) {
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  }
  return b.score - a.score;
});

export default function ResultsPage() {
  const params = useParams();
  const taskId = params.id;

  const [userType, setUserType] = useState<"student" | "recruiter" | null>(null);
  const showEmail = userType === "recruiter";

  useEffect(() => {
    const fetchUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("ユーザータイプ取得エラー:", error);
      } else {
        setUserType(data.user_type);
      }
    };

    fetchUserType();
  }, []);

  if (userType === null) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← ホームに戻る</Link>
        <h1 className={styles.title}>提出済みPR一覧</h1>
        <p className={styles.subtitle}>課題: ユーザー認証機能の実装</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>順位</th>
                <th>提出者</th>
                {showEmail && <th>メール</th>}
                <th>PRリンク</th>
                <th>提出日時</th>
                <th>スコア</th>
              </tr>
            </thead>
            <tbody>
              {submittedPRs.map((pr, index) => (
                <tr key={pr.id}>
                  <td className={styles.rank}>
                    {index < 3 ? null : index + 1}
                  </td>
                  <td className={styles.submitter}>{pr.submitter}</td>
                  {showEmail && <td>{pr.email}</td>}
                  <td>
                    <a
                      href={pr.prLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.prLink}
                    >
                      {pr.prLink}
                    </a>
                  </td>
                  <td className={styles.date}>{pr.submittedAt}</td>
                  <td className={styles.score}>{pr.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          {taskId && (
            <Link href={`/${taskId}`} className={styles.backButton}>
              課題詳細に戻る
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
