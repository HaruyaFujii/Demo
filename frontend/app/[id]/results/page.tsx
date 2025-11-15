import Link from "next/link";
import styles from "./page.module.css";

const submittedPRs = [
  {
    id: 1,
    submitter: "田中太郎",
    prLink: "https://github.com/example/repo/pull/123",
    submittedAt: "2025-11-15 10:30",
    status: "レビュー中",
  },
  {
    id: 2,
    submitter: "佐藤花子",
    prLink: "https://github.com/example/repo/pull/124",
    submittedAt: "2025-11-15 11:15",
    status: "承認済み",
  },
  {
    id: 3,
    submitter: "鈴木一郎",
    prLink: "https://github.com/example/repo/pull/125",
    submittedAt: "2025-11-15 13:45",
    status: "提出済み",
  },
  {
    id: 4,
    submitter: "高橋美咲",
    prLink: "https://github.com/example/repo/pull/126",
    submittedAt: "2025-11-15 14:20",
    status: "レビュー中",
  },
  {
    id: 5,
    submitter: "伊藤健太",
    prLink: "https://github.com/example/repo/pull/127",
    submittedAt: "2025-11-15 15:00",
    status: "承認済み",
  },
];

export default function ResultsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← ホームに戻る
        </Link>
        <h1 className={styles.title}>提出済みPR一覧</h1>
        <p className={styles.subtitle}>課題: ユーザー認証機能の実装</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>提出者</th>
                <th>PRリンク</th>
                <th>提出日時</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {submittedPRs.map((pr) => (
                <tr key={pr.id}>
                  <td className={styles.submitter}>{pr.submitter}</td>
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
                  <td>
                    <span
                      className={`${styles.status} ${
                        pr.status === "承認済み"
                          ? styles.statusApproved
                          : pr.status === "レビュー中"
                          ? styles.statusReviewing
                          : styles.statusSubmitted
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <Link href="/1" className={styles.backButton}>
            課題詳細に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
