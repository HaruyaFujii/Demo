"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function TaskDetailPage() {
  const handleSubmit = () => {
    alert("PRが送信されました！");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← ホームに戻る
        </Link>
        <h1 className={styles.title}>課題詳細</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.taskInfo}>
          <h2 className={styles.taskTitle}>ユーザー認証機能の実装</h2>
          <div className={styles.taskDescription}>
            <p>
              この課題では、アプリケーションにユーザー認証機能を実装します。
              以下の要件を満たすように実装してください：
            </p>
            <ul>
              <li>ログイン機能（メールアドレスとパスワード）</li>
              <li>ログアウト機能</li>
              <li>セッション管理</li>
              <li>パスワードの暗号化</li>
              <li>認証エラーハンドリング</li>
            </ul>
          </div>

          <div className={styles.linkSection}>
            <h3 className={styles.sectionTitle}>GitHub リポジトリ</h3>
            <a
              href="https://github.com/example/authentication-task"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              https://github.com/example/authentication-task
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
            />
          </div>

          <button onClick={handleSubmit} className={styles.submitButton}>
            PRを送信する
          </button>

          <Link href="/1/results" className={styles.resultsLink}>
            提出済みPR一覧を見る →
          </Link>
        </section>
      </main>
    </div>
  );
}