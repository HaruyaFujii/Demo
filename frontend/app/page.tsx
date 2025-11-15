import Link from "next/link";
import styles from "./page.module.css";

const tasks = [
  {
    id: "c3369d19-3063-424c-a9d8-36d6cef94c02",
    title: "ユーザー認証機能の実装",
    description: "ログイン・ログアウト機能を実装してください",
  },
  {
    id: 2,
    title: "データベース設計",
    description: "ユーザー情報を格納するテーブルを設計してください",
  },
  {
    id: 3,
    title: "API エンドポイントの作成",
    description: "RESTful APIのエンドポイントを実装してください",
  },
  {
    id: 4,
    title: "フロントエンド UI の改善",
    description: "レスポンシブデザインを適用してください",
  },
  {
    id: 5,
    title: "テストコードの追加",
    description: "ユニットテストとE2Eテストを追加してください",
  },
];

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>課題一覧</h1>
        {/* <p className={styles.subtitle}></p> */}
      </header>

      <main className={styles.main}>
        <div className={styles.taskGrid}>
          {tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskContent}>
                <h2 className={styles.taskTitle}>
                  課題 {task.id}: {task.title}
                </h2>
                <p className={styles.taskDescription}>{task.description}</p>
              </div>
              <Link href={`/${task.id}`} className={styles.detailButton}>
                詳細を見る
              </Link>
            </div>

          ))}
        </div>
      </main>
    </div>
  );
}
