import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { matchCats } from "@/lib/ai.functions";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cats")({
  head: () => ({
    meta: [
      { title: "Adoptable cats — MyMeow" },
      { name: "description", content: "Browse adoptable cats and use AI matching to find ones who fit your home and lifestyle." },
    ],
  }),
  component: CatsPage,
});

function CatsPage() {
  const { data: cats } = useQuery({
    queryKey: ["cats-all"],
    queryFn: async () => {
      const { data } = await supabase.from("cats").select("*").eq("status", "available").order("created_at");
      return data ?? [];
    },
  });
  const [lifestyle, setLifestyle] = useState("");
  const [matches, setMatches] = useState<{ catId: string; name: string; reason: string; score: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const run = useServerFn(matchCats);

  async function handleMatch() {
    if (!lifestyle.trim()) return;
    setLoading(true);
    try {
      const out = await run({ data: { lifestyle } });
      setMatches(out.matches);
    } catch (e) {
      toast.error("AI matching is busy — please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const matchSet = new Set(matches?.map((m) => m.catId) ?? []);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-4xl font-bold md:text-5xl">Adoptable cats</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Tell Mittens about your home and we'll surface the best matches first.</p>

        <div className="glass-card mt-8 rounded-3xl p-5 md:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> AI match
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <Input
              placeholder="e.g. Apartment in Mumbai, two kids (5 & 9), no other pets, want a calm cuddly cat…"
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              className="rounded-full bg-card"
            />
            <Button onClick={handleMatch} disabled={loading} className="rounded-full bg-primary px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find my matches"}
            </Button>
          </div>
          {matches && (
            <div className="mt-5 space-y-2">
              {matches.map((m) => (
                <div key={m.catId} className="flex items-start gap-3 rounded-2xl bg-accent/40 p-3 text-sm">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{m.score}</span>
                  <div><strong>{m.name}</strong> — {m.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(cats ?? [])
            .slice()
            .sort((a, b) => Number(matchSet.has(b.id)) - Number(matchSet.has(a.id)))
            .map((c) => (
              <Link key={c.id} to="/cats/$catId" params={{ catId: c.id }} className="glass-card group overflow-hidden rounded-3xl">
                <div className="relative aspect-square overflow-hidden">
                  <img src={c.image_url ?? ""} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {matchSet.has(c.id) && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">✨ AI match</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                    <span className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs">{c.energy_level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.age_years} yrs · {c.gender} · {c.breed}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(c.personality ?? []).slice(0, 3).map((p) => (
                      <span key={p} className="rounded-full bg-blush/40 px-2.5 py-0.5 text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
