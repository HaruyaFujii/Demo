"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("認証エラー:", error);
        router.push("/signin");
      } else {
        router.push("/");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontSize: "1.25rem"
    }}>
      認証中...
    </div>
  );
}
