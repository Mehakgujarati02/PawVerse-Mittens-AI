import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { FloatingPets } from "@/components/floating-pets";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Heart, ClipboardList, Home } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PawVerse — Find your perfect cat or dog with AI" },
      { name: "description", content: "Browse adoptable cats and dogs, chat with an AI counselor, and apply to adopt or foster in minutes. PawVerse makes pet adoption hassle-free." },
      { property: "og:title", content: "PawVerse — Find your perfect pet" },
      { property: "og:description", content: "AI-guided cat and dog adoption and foster matching." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: pets } = useQuery({
    queryKey: ["pets-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cats")
        .select("id,name,age_years,gender,image_url,energy_level,personality,species")
        .eq("status", "available")
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="relative min-h-screen">
      <FloatingPets count={7} />
      <div className="relative z-10">
      <SiteNav />


      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3 w-3" /> AI-powered adoption
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
              Find your <span className="text-primary">perfect</span> companion.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              PawVerse uses gentle AI to match you with cats and dogs who'll thrive in your home — then walks you through every step of fostering or adopting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary px-7 py-6 text-base hover:opacity-90">
                <Link to="/cats">Meet the pets</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 bg-card/60 px-7 py-6 text-base hover:bg-secondary/40">
                <Link to="/chat"><Sparkles className="mr-2 h-4 w-4" /> Chat with Mittens</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div><strong className="text-foreground text-xl font-display">240+</strong><div>pets placed</div></div>
              <div className="h-8 w-px bg-border" />
              <div><strong className="text-foreground text-xl font-display">98%</strong><div>foster success</div></div>
              <div className="h-8 w-px bg-border" />
              <div><strong className="text-foreground text-xl font-display">24/7</strong><div>AI guidance</div></div>
            </div>
          </div>

          <div className="relative">
            <div className="glass-card aspect-[4/5] overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900"
                alt="A cat and dog cuddling in soft afternoon light"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="glass-card absolute -bottom-6 -left-6 hidden rounded-2xl p-4 md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-xl">🐾</div>
                <div>
                  <div className="text-sm font-semibold">Mittens says</div>
                  <div className="text-xs text-muted-foreground">"I found 3 pets for you"</div>
                </div>
              </div>
            </div>
            <div className="glass-card absolute -top-4 -right-4 hidden rounded-2xl px-4 py-3 md:block">
              <div className="text-xs text-muted-foreground">Adoption time</div>
              <div className="text-lg font-display font-bold">~12 min</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="mb-8 text-3xl font-bold md:text-4xl">How PawVerse works</h2>
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: <Heart className="h-5 w-5" />, t: "Browse with AI", d: "Tell Mittens about your home. Get pets matched to your life." },
            { i: <ClipboardList className="h-5 w-5" />, t: "Apply in minutes", d: "One smart form. AI summarises your profile for the shelter." },
            { i: <Home className="h-5 w-5" />, t: "Foster or adopt", d: "Choose a permanent home or a foster trial first." },
            { i: <Sparkles className="h-5 w-5" />, t: "Guided onboarding", d: "Mittens helps you prep your home, food, vet visits." },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">{s.i}</div>
              <div className="mt-4 font-display text-xl font-bold">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold md:text-4xl">Meet a few sweethearts</h2>
          <Link to="/cats" className="text-sm font-semibold text-primary hover:underline">See all pets →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(pets ?? []).map((c) => (
            <Link key={c.id} to="/cats/$catId" params={{ catId: c.id }} className="glass-card group overflow-hidden rounded-3xl">
              <div className="aspect-square overflow-hidden">
                <img src={c.image_url ?? ""} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  <span className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs font-semibold">{c.species === "dog" ? "🐶 dog" : "🐱 cat"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.age_years} yrs · {c.gender} · {c.energy_level} energy</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(c.personality ?? []).slice(0, 3).map((p) => (
                    <span key={p} className="rounded-full bg-blush/40 px-2.5 py-0.5 text-xs">{p}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40 py-8 text-center text-sm text-muted-foreground">
        Made with 🐾 by PawVerse · A hackathon project · AI-powered pet adoption
      </footer>
    </div>
  );
}
