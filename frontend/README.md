# GitHub PR 自動評価システム

GitHub Pull Request (PR) の自動評価・管理システム。学生が提出したPRをCI/CDとAIで評価し、採用担当者が効率的にレビュー・管理できるようにするプラットフォームです。

## 主要機能

### 1. ユーザー認証
- メール/パスワードまたはGitHubアカウントでのログイン・サインアップ
- ユーザータイプ（学生 / 採用担当者）の選択
- Supabase認証による安全なユーザー管理

### 2. 課題管理
- 課題一覧の表示
- 課題詳細とGitHubリポジトリリンクの表示
- 1ユーザー・1課題につき1つのPRのみ提出可能

### 3. 自動評価システム

#### CIスコア評価（60%）
- GitHub APIでPRのCI/CDステータスをチェック
- 合格したチェック数 / 総チェック数で評価

#### AIコード評価（40%）
Google Gemini APIでコード品質を以下の5つの観点で分析：
- **可読性** (0-30点)
- **保守性** (0-25点)
- **堅牢性** (0-25点)
- **パフォーマンス** (0-10点)
- **セキュリティ** (0-10点)

具体的なフィードバック（良い点、改善点、重大な問題）を提供

#### 総合スコア
```
総合スコア = CIスコア × 60% + AIスコア × 40%
```

### 4. 提出一覧・ランキング
- 総合スコア順にランキング表示
- 採用担当者は全学生の提出を閲覧可能
- 学生は自分の提出のみ閲覧可能

### 5. 採用担当者向け機能
- ステータス管理（submitted / reviewing / approved / rejected）
- 上位N人の一括選択
- 選択した学生へのGmail一括メール送信
- メールアドレスのワンクリックコピー

## 技術スタック

### フロントエンド
- Next.js (App Router)
- TypeScript
- Supabase (認証・データベース)
- CSS Modules

### バックエンド
- Express.js
- TypeScript
- Supabase (データベース)
- GitHub API (Octokit)
- Google Gemini AI API

### データベース
- Supabase (PostgreSQL)
- テーブル: `assignments`, `user_profiles`, `submissions`

## セットアップ

### 環境変数の設定

#### フロントエンド (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### バックエンド (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
```

### インストールと起動

#### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

#### バックエンド
```bash
cd backend
npm install
npm run dev
```

### データベースセットアップ
`supabase/schema.sql` を実行してテーブルを作成

## ワークフロー

1. 学生がサインアップ・ログイン
2. 課題一覧から課題を選択
3. GitHubでPRを作成し、URLを提出
4. システムが自動でCI結果を取得
5. Gemini AIがコードを分析・評価
6. 総合スコアを計算してデータベースに保存
7. 採用担当者がランキングを確認
8. 詳細評価を閲覧し、ステータスを更新
9. 合格者にGmailで通知

## プロジェクト構成

```
Demo/
├── frontend/          # Next.js フロントエンド
│   ├── app/          # App Router ページ
│   ├── components/   # Reactコンポーネント
│   ├── lib/          # ユーティリティ
│   └── supabase/     # DBスキーマ
└── backend/          # Express.js バックエンド
    └── src/
        ├── api/      # APIルート
        ├── services/ # GitHub/Gemini連携
        └── schemas/  # スキーマ定義
```

## ライセンス

MIT
