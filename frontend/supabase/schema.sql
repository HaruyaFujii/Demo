-- Assignments (課題) テーブル
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_repo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Profiles (ユーザープロフィール) テーブル
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'recruiter')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Submissions (提出) テーブル
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected')),
  ci_score INTEGER,
  ai_score INTEGER,
  ai_evaluation_details JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(assignment_id, user_id)
);

-- Row Level Security (RLS) を有効化
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Assignments のポリシー: 誰でも読める
CREATE POLICY "Anyone can view assignments"
  ON assignments FOR SELECT
  USING (true);

-- Assignments のポリシー: 認証済みユーザーは作成可能（必要に応じて管理者のみに変更）
CREATE POLICY "Authenticated users can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- User Profiles のポリシー: 誰でも読める
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- User Profiles のポリシー: 認証済みユーザーは自分のプロフィールを作成可能
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Profiles のポリシー: 認証済みユーザーは自分のプロフィールを更新可能
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Submissions のポリシー: 誰でも読める
CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- Submissions のポリシー: 認証済みユーザーは自分の提出を作成可能
CREATE POLICY "Authenticated users can insert their own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Submissions のポリシー: 認証済みユーザーは自分の提出を更新可能
CREATE POLICY "Users can update their own submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Assignments テーブルのトリガー
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Profiles テーブルのトリガー
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Submissions テーブルのトリガー
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ: 課題を1件追加
INSERT INTO assignments (title, description, github_repo_url) VALUES (
  'ユーザー認証機能の実装',
  'この課題では、アプリケーションにユーザー認証機能を実装します。以下の要件を満たすように実装してください：
  
• ログイン機能（メールアドレスとパスワード）
• ログアウト機能
• セッション管理
• パスワードの暗号化
• 認証エラーハンドリング',
  'https://github.com/example/authentication-task'
);
