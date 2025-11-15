"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase";
import type { Submission } from "@/types/database";

interface SubmissionWithScore extends Submission {
  user_email?: string;
  score?: number;
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submissions, setSubmissions] = useState<SubmissionWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [userType, setUserType] = useState<"student" | "recruiter" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // ユーザータイプを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
        }
      }

      // 課題情報を取得
      const { data: assignment } = await supabase
        .from("assignments")
        .select("title")
        .eq("id", id)
        .single();

      if (assignment) {
        setAssignmentTitle(assignment.title);
      }

      // 提出データを取得
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", id)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("提出データの取得エラー:", error);
      } else {
        const formattedData = (data || []).map((item: any) => ({
          ...item,
          user_email: item.user_id, // とりあえずuser_idを表示
          score: Math.floor(Math.random() * 30) + 70, // TODO: 実際のスコアに置き換え
        }));

        // スコア順にソート
        formattedData.sort((a, b) => {
          if (b.score === a.score) {
            return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          }
          return (b.score || 0) - (a.score || 0);
        });

        setSubmissions(formattedData);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>読み込み中...</div>
      </div>
    );
  }

  const showEmail = userType === "recruiter";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← ホームに戻る</Link>
        <h1 className={styles.title}>提出済みPR一覧</h1>
        <p className={styles.subtitle}>課題: {assignmentTitle}</p>
      </header>

      <main className={styles.main}>
        {submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            まだ提出がありません
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>順位</th>
                  {showEmail && <th>メール</th>}
                  <th>PRリンク</th>
                  <th>提出日時</th>
                  <th>スコア</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={submission.id}>
                    <td className={styles.rank}>{index + 1}</td>
                    {showEmail && <td className={styles.submitter}>{submission.user_email || "不明"}</td>}
                    <td>
                      <a
                        href={submission.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.prLink}
                      >
                        {submission.pr_url}
                      </a>
                    </td>
                    <td className={styles.date}>
                      {new Date(submission.submitted_at).toLocaleString("ja-JP")}
                    </td>
                    <td className={styles.score}>{submission.score || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.actions}>
          <Link href={`/${id}`} className={styles.backButton}>
            課題詳細に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
