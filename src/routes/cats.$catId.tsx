import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Home, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/cats/$catId")({
  component: CatDetail,
});

function CatDetail() {
  const { catId } = useParams({ from: "/cats/$catId" });
  const { data: cat, isLoading } = useQuery({
    queryKey: ["cat", catId],
    queryFn: async () => {
      const { data } = await supabase.from("cats").select("*").eq("id", catId).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen"><SiteNav /><div className="p-12 text-center text-muted-foreground">Loading…</div></div>;
  if (!cat) return <div className="min-h-screen"><SiteNav /><div className="p-12 text-center">Pet not found.</div></div>;

  const speciesLabel = cat.species === "dog" ? "🐶 Dog" : "🐱 Cat";

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/cats" className="text-sm text-primary hover:underline">← All pets</Link>
        <div className="mt-4 grid gap-10 md:grid-cols-2">
          <div className="glass-card overflow-hidden rounded-[2rem]">
            <img src={cat.image_url ?? ""} alt={cat.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold">{speciesLabel}</span>
            <h1 className="mt-2 text-5xl font-bold md:text-6xl">{cat.name}</h1>
            <p className="mt-2 text-muted-foreground">{cat.age_years} yrs · {cat.gender} · {cat.breed} · {cat.color}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(cat.personality ?? []).map((p: string) => (
                <span key={p} className="rounded-full bg-blush/50 px-3 py-1 text-xs font-medium">{p}</span>
              ))}
              <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-medium">energy: {cat.energy_level}</span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-foreground/85">{cat.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card rounded-2xl p-4">
                <dt className="text-muted-foreground">Good with kids</dt>
                <dd className="text-lg font-semibold">{cat.good_with_kids ? "Yes 🧒" : "Best adult home"}</dd>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <dt className="text-muted-foreground">Good with pets</dt>
                <dd className="text-lg font-semibold">{cat.good_with_pets ? "Yes 🐾" : "Only-pet preferred"}</dd>
              </div>
              <div className="glass-card col-span-2 rounded-2xl p-4">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="text-lg font-semibold">{cat.location}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary px-7">
                <Link to="/apply" search={{ catId: cat.id, type: "adoption" }}>
                  <Heart className="mr-2 h-4 w-4" /> Apply to adopt
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/apply" search={{ catId: cat.id, type: "foster" }}>
                  <Home className="mr-2 h-4 w-4" /> Foster {cat.name}
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full">
                <Link to="/chat" search={{ catId: cat.id }}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Ask about {cat.name}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
