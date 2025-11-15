"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase";
import type { Submission } from "@/types/database";

interface SubmissionWithScore extends Submission {
  user_email?: string;
  total_score?: number;
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submissions, setSubmissions] = useState<SubmissionWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [userType, setUserType] = useState<"student" | "recruiter" | null>(null);
  const [copiedEmails, setCopiedEmails] = useState<Set<string>>(new Set());
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [topN, setTopN] = useState<number>(30);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [statusUpdating, setStatusUpdating] = useState<Set<string>>(new Set());

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmails(prev => new Set(prev).add(email));
      setShowCopiedToast(true);
      
      // 2秒後にチェックマークを消す
      setTimeout(() => {
        setCopiedEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(email);
          return newSet;
        });
      }, 2000);

      // 2秒後にトーストを消す
      setTimeout(() => {
        setShowCopiedToast(false);
      }, 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
      alert("コピーに失敗しました");
    }
  };

  // 全選択/全解除
  const toggleAllStudents = () => {
    if (selectedStudents.size === submissions.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(submissions.map((_, idx) => idx)));
    }
  };

  // 上位N人を選択
  const selectTopN = () => {
    const topIndices = new Set<number>();
    for (let i = 0; i < Math.min(topN, submissions.length); i++) {
      topIndices.add(i);
    }
    setSelectedStudents(topIndices);
  };

  // 個別選択トグル
  const toggleStudent = (index: number) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // ステータス更新
  const updateStatus = async (submissionId: string, newStatus: string) => {
    setStatusUpdating(prev => new Set(prev).add(submissionId));
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("id", submissionId);

      if (error) {
        console.error("ステータス更新エラー:", error);
        alert("ステータスの更新に失敗しました");
      } else {
        // UIを更新
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: newStatus as any } : sub
          )
        );
      }
    } catch (err) {
      console.error("ステータス更新エラー:", err);
      alert("ステータスの更新に失敗しました");
    } finally {
      setStatusUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  // メール下書き作成
  const createEmailDraft = () => {
    const selectedEmails = submissions
      .filter((_, idx) => selectedStudents.has(idx))
      .map(sub => sub.user_email)
      .filter(email => email && email !== "不明")
      .join(",");

    if (!selectedEmails) {
      alert("メールアドレスが選択されていません");
      return;
    }

    const subject = `【${assignmentTitle}】評価結果のお知らせ`;
    const body =
    `お疲れ様です。\n\n` +
    `課題「${assignmentTitle}」の評価が完了しましたのでお知らせいたします。\n\n` +
    `合格おめでとうございます！\n` +
    `何かご質問があればお気軽にお問い合わせください。\n\n` +
    `よろしくお願いいたします。`;

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(selectedEmails)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  if (typeof window !== "undefined") {
    // 新しいタブで開く
    window.open(gmailUrl, "_blank");
    // もしくは現在タブで開きたいなら:
    // window.location.href = gmailUrl;
  }
  };

  useEffect(() => {
    const fetchData = async () => {
      // ユーザータイプを取得
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserType: "student" | "recruiter" | null = null;
      let currentUserId: string | null = null;

      if (user) {
        currentUserId = user.id;
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (profile) {
          currentUserType = profile.user_type;
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

      // 提出データを取得 (studentの場合は自分のPRのみ、recruiterの場合は全て)
      let query = supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", id);

      // studentの場合は自分の提出のみに絞り込み
      if (currentUserType === "student" && currentUserId) {
        query = query.eq("user_id", currentUserId);
      }

      const { data, error } = await query.order("submitted_at", { ascending: false });

      if (error) {
        console.error("提出データの取得エラー:", error);
      } else {
        // 各提出に対してユーザー情報を取得
        const formattedData = await Promise.all((data || []).map(async (item: any) => {
          // 総合スコアを計算 (CI:AI = 6:4)
          const ciScore = item.ci_score || 0;
          const aiScore = item.ai_score || 0;
          const totalScore = Math.round(ciScore * 0.6 + aiScore * 0.4);
          
          // user_profilesからメールアドレスを取得
          const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("email")
            .eq("id", item.user_id)
            .single();
          
          return {
            ...item,
            user_email: userProfile?.email || "不明",
            total_score: totalScore,
          };
        }));

        // 総合スコア順にソート
        formattedData.sort((a, b) => {
          if (b.total_score === a.total_score) {
            return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          }
          return (b.total_score || 0) - (a.total_score || 0);
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
      {showCopiedToast && (
        <div className={styles.toast}>
          Copied!
        </div>
      )}
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
          <>
            {showEmail && (
              <div className={styles.controlBar}>
                <div className={styles.controlLeft}>
                  <label className={styles.topNLabel}>
                    Top
                    <input
                      type="number"
                      min="1"
                      max={submissions.length}
                      value={topN}
                      onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
                      className={styles.topNInput}
                    />
                    人
                  </label>
                  <button onClick={selectTopN} className={styles.selectButton}>
                    上位{topN}人を選択
                  </button>
                  <span className={styles.selectedCount}>
                    {selectedStudents.size}人選択中
                  </span>
                </div>
                <button
                  onClick={createEmailDraft}
                  className={styles.emailButton}
                  disabled={selectedStudents.size === 0}
                >
                  ✉ メール送信
                </button>
              </div>
            )}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {showEmail && (
                      <th className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.size === submissions.length && submissions.length > 0}
                          onChange={toggleAllStudents}
                          className={styles.checkbox}
                          title="全選択/全解除"
                        />
                      </th>
                    )}
                    <th>順位</th>
                    {showEmail && <th>メール</th>}
                    <th>PRリンク</th>
                    <th>提出日時</th>
                    <th>総合スコア</th>
                    <th>CIスコア</th>
                    <th>AIスコア</th>
                    {showEmail && <th>ステータス</th>}
                    <th>詳細</th>
                  </tr>
                </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={submission.id}>
                    {showEmail && (
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(index)}
                          onChange={() => toggleStudent(index)}
                          className={styles.checkbox}
                        />
                      </td>
                    )}
                    <td className={styles.rank}>{index + 1}</td>
                    {showEmail && (
                      <td className={styles.submitter}>
                        <div className={styles.emailCell}>
                          <span className={styles.emailText}>{submission.user_email || "不明"}</span>
                          <button
                            onClick={() => copyToClipboard(submission.user_email || "不明")}
                            className={styles.copyButton}
                            title="クリックでコピー"
                          >
                            {copiedEmails.has(submission.user_email || "") ? "✓" : "📋"}
                          </button>
                        </div>
                      </td>
                    )}
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
                    <td className={styles.score}>{submission.total_score !== undefined ? submission.total_score : "-"}</td>
                    <td className={styles.score}>{submission.ci_score !== undefined ? submission.ci_score : "-"}</td>
                    <td className={styles.score}>{submission.ai_score !== undefined ? submission.ai_score : "-"}</td>
                    {showEmail && (
                      <td className={styles.statusCell}>
                        <select
                          value={submission.status}
                          onChange={(e) => updateStatus(submission.id, e.target.value)}
                          className={styles.statusSelect}
                          disabled={statusUpdating.has(submission.id)}
                        >
                          <option value="submitted">提出済み</option>
                          <option value="reviewing">レビュー中</option>
                          <option value="approved">承認済み</option>
                          <option value="rejected">却下</option>
                        </select>
                      </td>
                    )}
                    <td>
                      <Link 
                        href={`/${id}/results/${submission.id}`}
                        className={styles.detailLink}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
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