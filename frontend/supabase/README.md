# Supabase テーブル設計

## テーブル構造

### 1. `assignments` (課題テーブル)

課題の情報を格納します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー (自動生成) |
| title | TEXT | 課題のタイトル |
| description | TEXT | 課題の詳細説明 |
| github_repo_url | TEXT | GitHubリポジトリURL |
| created_at | TIMESTAMP | 作成日時 (UTC) |
| updated_at | TIMESTAMP | 更新日時 (UTC、自動更新) |

### 2. `submissions` (提出テーブル)

ユーザーのPR提出情報を格納します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー (自動生成) |
| assignment_id | UUID | 課題ID (外部キー) |
| user_id | UUID | ユーザーID (auth.users参照) |
| pr_url | TEXT | PR URL |
| status | TEXT | ステータス (submitted/reviewing/approved/rejected) |
| submitted_at | TIMESTAMP | 提出日時 (UTC) |
| updated_at | TIMESTAMP | 更新日時 (UTC、自動更新) |

**制約:**
- `(assignment_id, user_id)` のユニーク制約（1ユーザーは1課題につき1つのPRのみ提出可能）

## Row Level Security (RLS) ポリシー

### Assignments
- **読み取り**: 誰でも可能
- **作成**: 認証済みユーザー

### Submissions
- **読み取り**: 誰でも可能
- **作成**: 認証済みユーザー（自分の提出のみ）
- **更新**: 認証済みユーザー（自分の提出のみ）

## セットアップ手順

1. Supabaseダッシュボードにログイン
2. 「SQL Editor」を開く
3. `supabase/schema.sql` の内容をコピー&ペースト
4. 実行してテーブルを作成

サンプルデータとして1件の課題が自動的に追加されます。

## TypeScript型定義

```typescript
export interface Assignment {
  id: string;
  title: string;
  description: string;
  github_repo_url: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  pr_url: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submitted_at: string;
  updated_at: string;
}
```
