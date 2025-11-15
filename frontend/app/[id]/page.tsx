"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Assignment } from "@/types/database";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState("");

  useEffect(() => {
    const fetchAssignment = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("課題の取得エラー:", error);
      } else {
        setAssignment(data);
      }
      setLoading(false);
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async () => {
    if (!prUrl) {
      alert("PRリンクを入力してください");
      return;
    }

    setSubmitting(true);
    try {
      // CI結果を取得
      const ciRes = await fetch('http://localhost:3001/api/pr/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prUrl }),
      });

      if (!ciRes.ok) {
        const text = await ciRes.text();
        throw new Error(`CI check failed: ${ciRes.status} ${text}`);
      }

      const ciData = await ciRes.json();
      const ciScore = ciData.ciTotal > 0 ? Math.round((ciData.ciPassed / ciData.ciTotal) * 100) : 0;

      // AI評価を取得
      const aiRes = await fetch('http://localhost:3001/api/pr/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prUrl }),
      });

      if (!aiRes.ok) {
        const text = await aiRes.text();
        throw new Error(`AI evaluation failed: ${aiRes.status} ${text}`);
      }

      const aiData = await aiRes.json();
      const aiScore = aiData.overallScore;

      // 総合スコアを計算 (CI:AI = 6:4)
      const totalScore = Math.round(ciScore * 0.6 + aiScore * 0.4);

      alert(`【評価結果】
CI スコア: ${ciScore}点 (重み: 60%)
AI スコア: ${aiScore}点 (重み: 40%)
総合スコア: ${totalScore}点`);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("ログインが必要です");
        return;
      }

      const { error } = await supabase
        .from("submissions")
        .insert({
          assignment_id: id,
          user_id: userData.user.id,
          pr_url: prUrl,
          status: "submitted",
          ci_score: ciScore,
          ai_score: aiScore,
          ai_evaluation_details: {
            scores: aiData.scores,
            feedback: aiData.feedback,
          },
        });

      if (error) {
        if (error.code === "23505") {
          alert("すでにこの課題にPRを提出済みです");
        } else {
          alert(`提出エラー: ${error.message}`);
        }
      } else {
        setPrUrl("");
      }
    } catch (error) {
      alert(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>読み込み中...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          課題が見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>

        <Link href="/" className={styles.backLink}>
          ← ホームに戻る
        </Link>

        <img src="/Logo.png" alt="Logo" className={styles.logo} />
        
        <h1 className={styles.title}>課題詳細</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.taskInfo}>
          <h2 className={styles.taskTitle}>{assignment.title}</h2>
          <div className={styles.taskDescription}>
            <p style={{ whiteSpace: "pre-wrap" }}>{assignment.description}</p>
          </div>

          <div className={styles.linkSection}>
            <h3 className={styles.sectionTitle}>GitHub リポジトリ</h3>
            <a
              href={assignment.github_repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              {assignment.github_repo_url}
            </a>
          </div>
        </section>

        <section className={styles.submitSection}>
          <h3 className={styles.sectionTitle}>PR リンクを提出</h3>
          <div className={styles.formGroup}>
            <label htmlFor="prLink" className={styles.label}>
              あなたのPRリンク
            </label>
            <input
              type="url"
              id="prLink"
              className={styles.input}
              placeholder="https://github.com/example/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
            />
          </div>

          <button onClick={handleSubmit} className={styles.submitButton} disabled={submitting}>
            {submitting ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner}></span>
                評価中...
              </span>
            ) : (
              "PRを送信する"
            )}
          </button>

          <Link href={`/${id}/results`} className={styles.resultsLink}>
            提出済みPR一覧を見る →
          </Link>
        </section>
      </main>
    </div>
  );
}