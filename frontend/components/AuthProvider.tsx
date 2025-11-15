"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // サインインページ以外でログインしていない場合はリダイレクト
      if (!data.session && pathname !== "/signin" && !pathname.startsWith("/auth")) {
        router.push("/signin");
      }
      
      setLoading(false);
    };

    checkAuth();

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          if (pathname === "/signin") {
            router.push("/");
          }
        } else if (event === "SIGNED_OUT") {
          router.push("/signin");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  return <>{children}</>;
}
