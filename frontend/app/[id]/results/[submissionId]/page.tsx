"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase";
import type { Submission } from "@/types/database";

interface SubmissionDetail extends Submission {
  user_email?: string;
  assignment_title?: string;
  total_score?: number;
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = use(params);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      // 提出データを取得
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (submissionError) {
        console.error("提出データの取得エラー:", submissionError);
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", submissionData.user_id)
        .single();

      // 課題情報を取得
      const { data: assignment } = await supabase
        .from("assignments")
        .select("title")
        .eq("id", submissionData.assignment_id)
        .single();

      // 総合スコアを計算
      const ciScore = submissionData.ci_score || 0;
      const aiScore = submissionData.ai_score || 0;
      const totalScore = Math.round(ciScore * 0.6 + aiScore * 0.4);

      setSubmission({
        ...submissionData,
        user_email: userProfile?.email || "不明",
        assignment_title: assignment?.title || "不明",
        total_score: totalScore,
      });

      setLoading(false);
    };

    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>提出データが見つかりません</div>
      </div>
    );
  }

  const aiDetails = submission.ai_evaluation_details;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/${id}/results`} className={styles.backLink}>
          ← 一覧に戻る
        </Link>
        <h1 className={styles.title}>PR詳細</h1>
        <p className={styles.subtitle}>{submission.assignment_title}</p>
      </header>

      <main className={styles.main}>
        {/* 基本情報 */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>基本情報</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>提出者</span>
              <span className={styles.value}>{submission.user_email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>提出日時</span>
              <span className={styles.value}>
                {new Date(submission.submitted_at).toLocaleString("ja-JP")}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>ステータス</span>
              <span className={`${styles.value} ${styles.status}`}>
                {submission.status === "submitted" && "提出済み"}
                {submission.status === "reviewing" && "レビュー中"}
                {submission.status === "approved" && "承認済み"}
                {submission.status === "rejected" && "却下"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>PRリンク</span>
              <a
                href={submission.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.prLink}
              >
                {submission.pr_url}
              </a>
            </div>
          </div>
        </section>

        {/* スコア */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>評価スコア</h2>
          <div className={styles.scoreGrid}>
            <div className={styles.scoreCard}>
              <div className={styles.scoreLabel}>総合スコア</div>
              <div className={styles.scoreValue}>
                {submission.total_score}
                <span className={styles.scoreUnit}>点</span>
              </div>
              <div className={styles.scoreDescription}>CI 60% + AI 40%</div>
            </div>
            <div className={styles.scoreCard}>
              <div className={styles.scoreLabel}>CIスコア</div>
              <div className={styles.scoreValue}>
                {submission.ci_score !== undefined ? submission.ci_score : "-"}
                <span className={styles.scoreUnit}>点</span>
              </div>
              <div className={styles.scoreDescription}>重み: 60%</div>
            </div>
            <div className={styles.scoreCard}>
              <div className={styles.scoreLabel}>AIスコア</div>
              <div className={styles.scoreValue}>
                {submission.ai_score !== undefined ? submission.ai_score : "-"}
                <span className={styles.scoreUnit}>点</span>
              </div>
              <div className={styles.scoreDescription}>重み: 40%</div>
            </div>
          </div>
        </section>

        {/* AI詳細評価 */}
        {aiDetails?.scores && aiDetails?.feedback && (
          <>
            {/* 項目別スコア */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>項目別スコア</h2>
              <div className={styles.detailScoreGrid}>
                <div className={styles.detailScoreItem}>
                  <div className={styles.detailScoreHeader}>
                    <span className={styles.detailScoreLabel}>可読性</span>
                    <span className={styles.detailScoreValue}>
                      {aiDetails.scores.readability}/30
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(aiDetails.scores.readability / 30) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.detailScoreItem}>
                  <div className={styles.detailScoreHeader}>
                    <span className={styles.detailScoreLabel}>保守性</span>
                    <span className={styles.detailScoreValue}>
                      {aiDetails.scores.maintainability}/25
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(aiDetails.scores.maintainability / 25) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.detailScoreItem}>
                  <div className={styles.detailScoreHeader}>
                    <span className={styles.detailScoreLabel}>堅牢性</span>
                    <span className={styles.detailScoreValue}>
                      {aiDetails.scores.robustness}/25
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(aiDetails.scores.robustness / 25) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.detailScoreItem}>
                  <div className={styles.detailScoreHeader}>
                    <span className={styles.detailScoreLabel}>パフォーマンス</span>
                    <span className={styles.detailScoreValue}>
                      {aiDetails.scores.performance}/10
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(aiDetails.scores.performance / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.detailScoreItem}>
                  <div className={styles.detailScoreHeader}>
                    <span className={styles.detailScoreLabel}>セキュリティ</span>
                    <span className={styles.detailScoreValue}>
                      {aiDetails.scores.security}/10
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(aiDetails.scores.security / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* フィードバック */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>AIフィードバック</h2>

              {aiDetails.feedback.strengths.length > 0 && (
                <div className={styles.feedbackSection}>
                  <h3 className={styles.feedbackTitle}>
                    <span className={styles.iconGood}>✓</span>
                    良い点
                  </h3>
                  <ul className={styles.feedbackList}>
                    {aiDetails.feedback.strengths.map((item, index) => (
                      <li key={index} className={styles.feedbackItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiDetails.feedback.improvements.length > 0 && (
                <div className={styles.feedbackSection}>
                  <h3 className={styles.feedbackTitle}>
                    <span className={styles.iconWarning}>⚠</span>
                    改善点
                  </h3>
                  <ul className={styles.feedbackList}>
                    {aiDetails.feedback.improvements.map((item, index) => (
                      <li key={index} className={styles.feedbackItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiDetails.feedback.criticalIssues.length > 0 && (
                <div className={styles.feedbackSection}>
                  <h3 className={styles.feedbackTitle}>
                    <span className={styles.iconError}>✕</span>
                    重大な問題
                  </h3>
                  <ul className={styles.feedbackList}>
                    {aiDetails.feedback.criticalIssues.map((item, index) => (
                      <li key={index} className={styles.feedbackItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}

        <div className={styles.actions}>
          <Link href={`/${id}/results`} className={styles.backButton}>
            一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}