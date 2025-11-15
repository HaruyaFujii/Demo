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
      const { data: { session } } = await supabase.auth.getSession();
      
      // 認証不要なページ
      const publicPaths = ["/signin", "/auth/callback"];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      if (!session && !isPublicPath) {
        router.push("/signin");
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []); // 初回マウント時のみ実行

  useEffect(() => {
    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", !!session);
        
        const publicPaths = ["/signin", "/auth/callback"];
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
        
        if (event === "SIGNED_IN" && isPublicPath) {
          router.push("/");
          router.refresh();
        } else if (event === "SIGNED_OUT" && !isPublicPath) {
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
