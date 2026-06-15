import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/foster")({
  head: () => ({
    meta: [
      { title: "Foster a cat — MyMeow" },
      { name: "description", content: "Open your home temporarily. Fostering saves lives and helps cats decompress before adoption." },
    ],
  }),
  component: Foster,
});

function Foster() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="glass-card overflow-hidden rounded-[2rem] md:grid md:grid-cols-2">
          <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900" alt="A foster cat in a warm sunbeam" className="h-72 w-full object-cover md:h-full" />
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold md:text-5xl">Foster a cat 🏡</h1>
            <p className="mt-3 text-muted-foreground">Fostering is the kindest first step. You give a cat a safe room to decompress, while we cover food and vet care.</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="paw-bullet">2–8 week placements</li>
              <li className="paw-bullet">All supplies & vet care covered</li>
              <li className="paw-bullet">24/7 AI + human support</li>
              <li className="paw-bullet">No long-term commitment</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-primary px-6 py-5">
                <Link to="/apply" search={{ type: "foster" }}>Apply to foster</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6 py-5">
                <Link to="/chat">Have questions? Ask Mittens</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
