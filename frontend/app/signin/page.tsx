"use client";

import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthMode = "signin" | "signup";
type UserType = "student" | "recruiter";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleGitHubLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("GitHub login error:", error);
        alert(`ログインエラー: ${error.message}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("予期しないエラーが発生しました");
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }

    if (authMode === "signup" && password.length < 6) {
      alert("パスワードは6文字以上で入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
            },
          },
        });

        if (error) {
          alert(`サインアップエラー: ${error.message}`);
          return;
        }

        if (data.user) {
          // ユーザープロフィールを作成
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: data.user.id,
              email: email,
              user_type: userType,
            });

          if (profileError) {
            console.error("プロフィール作成エラー:", profileError);
          }

          // メール確認が必要な場合
          if (data.session === null) {
            alert("確認メールを送信しました。メールを確認してアカウントを有効化してください。");
          } else {
            alert("アカウントが作成されました！");
            router.push("/");
          }
        }
      } else {
        // サインイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Login error:", error);
          alert(`ログインエラー: ${error.message}`);
          return;
        }

        if (data.session) {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(`エラー: ${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>PR評価システム</h1>
        
        {/* タブ切り替え */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${authMode === "signin" ? styles.tabActive : ""}`}
            onClick={() => setAuthMode("signin")}
          >
            ログイン
          </button>
          <button
            className={`${styles.tab} ${authMode === "signup" ? styles.tabActive : ""}`}
            onClick={() => setAuthMode("signup")}
          >
            新規登録
          </button>
        </div>

        {/* メール認証フォーム */}
        <div className={styles.formSection}>
          <input
            type="email"
            className={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
          />
          <input
            type="password"
            className={styles.input}
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
          />

          {/* ユーザータイプ選択（サインアップ時のみ） */}
          {authMode === "signup" && (
            <div className={styles.userTypeSection}>
              <label className={styles.userTypeLabel}>アカウントタイプ</label>
              <div className={styles.userTypeButtons}>
                <button
                  type="button"
                  className={`${styles.userTypeButton} ${
                    userType === "student" ? styles.userTypeButtonActive : ""
                  }`}
                  onClick={() => setUserType("student")}
                >
                  学生
                </button>
                <button
                  type="button"
                  className={`${styles.userTypeButton} ${
                    userType === "recruiter" ? styles.userTypeButtonActive : ""
                  }`}
                  onClick={() => setUserType("recruiter")}
                >
                  採用担当者
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "処理中..."
              : authMode === "signin"
              ? "ログイン"
              : "新規登録"}
          </button>
        </div>

        <div className={styles.divider}>または</div>

        {/* GitHub認証 */}
        <button onClick={handleGitHubLogin} className={styles.githubButton}>
          <svg
            className={styles.githubIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHubでログイン
        </button>
      </div>
    </div>
  );
}
