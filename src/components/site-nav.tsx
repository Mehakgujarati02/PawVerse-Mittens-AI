import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function SiteNav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="glass-card flex items-center justify-between rounded-full px-5 py-2.5">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
            <span className="text-3xl">🐾</span>
            MyMeow
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/cats" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary/40 hover:text-foreground">Browse cats</Link>
            <Link to="/foster" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary/40 hover:text-foreground">Foster</Link>
            <Link to="/chat" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary/40 hover:text-foreground">
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Ask Mittens</span>
            </Link>
            <Link to="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/60 hover:bg-secondary/40 hover:text-foreground">Admin</Link>
          </nav>
          <div className="flex items-center gap-2">
            {email ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
                <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
              </>
            ) : (
              <Button size="sm" asChild className="rounded-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
