import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServerFn } from "@tanstack/react-start";
import { generateIntakeDoc } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Shelter admin — PawVerse" }] }),
  component: Admin,
});

type App = {
  id: string;
  applicant_name: string;
  email: string;
  application_type: string;
  status: string;
  cat_id: string | null;
  why_adopt: string;
  created_at: string;
};

function Admin() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setIsAdmin(false); return; }
      setUser({ id: data.user.id });
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin" || r.role === "staff");
      setIsAdmin(admin);
      if (admin) {
        const [a, c] = await Promise.all([
          supabase.from("adoption_applications").select("*").order("created_at", { ascending: false }),
          supabase.from("cats").select("id,name").order("name"),
        ]);
        setApps((a.data as App[]) ?? []);
        setCats(c.data ?? []);
      }
    });
  }, []);

  if (isAdmin === null) return <div className="min-h-screen"><SiteNav /><div className="p-12 text-center text-muted-foreground">Loading…</div></div>;
  if (!user) return <NotAllowed reason="Please sign in." />;
  if (!isAdmin) return <NotAllowed reason="You don't have admin access yet." userId={user.id} />;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-bold">Shelter dashboard</h1>
        <p className="text-muted-foreground">Intake, applications, all in one place.</p>

        <Tabs defaultValue="apps" className="mt-8">
          <TabsList className="rounded-full bg-card">
            <TabsTrigger value="apps" className="rounded-full">Applications ({apps.length})</TabsTrigger>
            <TabsTrigger value="intake" className="rounded-full">AI intake</TabsTrigger>
          </TabsList>
          <TabsContent value="apps" className="mt-6">
            <ApplicationsList apps={apps} cats={cats} onUpdate={async () => {
              const { data } = await supabase.from("adoption_applications").select("*").order("created_at", { ascending: false });
              setApps((data as App[]) ?? []);
            }} />
          </TabsContent>
          <TabsContent value="intake" className="mt-6">
            <IntakeForm onCreated={async () => {
              const { data } = await supabase.from("cats").select("id,name").order("name");
              setCats(data ?? []);
              toast.success("Cat added to listings!");
            }} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function NotAllowed({ reason, userId }: { reason: string; userId?: string }) {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-3 text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
          {userId && (
            <p className="mt-4 break-all rounded-xl bg-muted p-3 text-left font-mono text-xs">
              Your user ID: {userId}
              <br /><br />
              To grant yourself admin, ask your project owner to run:<br />
              <code>INSERT INTO public.user_roles (user_id, role) VALUES ('{userId}', 'admin');</code>
            </p>
          )}
          <Button asChild className="mt-5 rounded-full"><Link to="/auth">Sign in</Link></Button>
        </div>
      </main>
    </div>
  );
}

function ApplicationsList({ apps, cats, onUpdate }: { apps: App[]; cats: { id: string; name: string }[]; onUpdate: () => void }) {
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "—";
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("adoption_applications").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    onUpdate();
  }
  if (apps.length === 0) return <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">No applications yet.</div>;
  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <div key={a.id} className="glass-card rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{a.applicant_name} <span className="ml-2 rounded-full bg-blush/50 px-2 py-0.5 text-xs">{a.application_type}</span></div>
              <div className="text-xs text-muted-foreground">{a.email} · for {catName(a.cat_id)} · {new Date(a.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                a.status === "approved" ? "bg-accent/70" : a.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-muted"
              }`}>{a.status}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground/85">{a.why_adopt}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(a.id, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(a.id, "rejected")}>Reject</Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus(a.id, "pending")}>Reset</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function IntakeForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", species: "cat" as "cat" | "dog", age_years: 1, gender: "Female", breed: "", color: "", notes: "", image_url: "", location: "" });
  const [ai, setAi] = useState<{ description: string; personality: string[]; energy_level: string; good_with_kids: boolean; good_with_pets: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const run = useServerFn(generateIntakeDoc);

  async function aiGenerate() {
    setBusy(true);
    try {
      const out = await run({ data: { name: form.name, species: form.species, age_years: Number(form.age_years), gender: form.gender, breed: form.breed, color: form.color, notes: form.notes } });
      setAi(out);
    } catch (e) { toast.error("AI generation failed"); console.error(e); } finally { setBusy(false); }
  }

  async function save() {
    if (!ai) return;
    const { error } = await supabase.from("cats").insert({
      name: form.name,
      species: form.species,
      age_years: Number(form.age_years),
      gender: form.gender,
      breed: form.breed || null,
      color: form.color || null,
      image_url: form.image_url || null,
      location: form.location || null,
      intake_notes: form.notes,
      description: ai.description,
      personality: ai.personality,
      energy_level: ai.energy_level,
      good_with_kids: ai.good_with_kids,
      good_with_pets: ai.good_with_pets,
    });
    if (error) { toast.error(error.message); return; }
    setForm({ name: "", species: "cat", age_years: 1, gender: "Female", breed: "", color: "", notes: "", image_url: "", location: "" });
    setAi(null);
    onCreated();
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" /> Intake — AI writes the listing for you
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Species</Label>
          <select className="mt-1.5 w-full rounded-md border bg-card px-3 py-2 text-sm" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value as "cat" | "dog" })}>
            <option value="cat">🐱 Cat</option><option value="dog">🐶 Dog</option>
          </select>
        </div>
        <div><Label>Name</Label><Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Age (years)</Label><Input className="mt-1.5" type="number" step="0.5" value={form.age_years} onChange={(e) => setForm({ ...form, age_years: Number(e.target.value) })} /></div>
        <div><Label>Gender</Label>
          <select className="mt-1.5 w-full rounded-md border bg-card px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Female</option><option>Male</option>
          </select>
        </div>
        <div><Label>Breed</Label><Input className="mt-1.5" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></div>
        <div><Label>Color</Label><Input className="mt-1.5" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
        <div><Label>Location</Label><Input className="mt-1.5" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Image URL</Label><Input className="mt-1.5" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Intake notes (raw)</Label>
          <Textarea className="mt-1.5" rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Surrendered after owner moved. Shy at first, warms up in 2 days. FIV neg, vaccinated 2024-11. Loves chin scratches." />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button onClick={aiGenerate} disabled={busy || !form.name || !form.notes} className="rounded-full bg-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Generate listing with AI</>}
        </Button>
        {ai && <Button onClick={save} variant="outline" className="rounded-full">Save to listings</Button>}
      </div>

      {ai && (
        <div className="mt-5 rounded-2xl bg-accent/30 p-5">
          <div className="text-xs font-semibold text-muted-foreground">AI-generated listing</div>
          <p className="mt-2 text-sm">{ai.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {ai.personality.map((p) => <span key={p} className="rounded-full bg-blush/50 px-2.5 py-0.5">{p}</span>)}
            <span className="rounded-full bg-card px-2.5 py-0.5">energy: {ai.energy_level}</span>
            <span className="rounded-full bg-card px-2.5 py-0.5">kids: {ai.good_with_kids ? "yes" : "no"}</span>
            <span className="rounded-full bg-card px-2.5 py-0.5">pets: {ai.good_with_pets ? "yes" : "no"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
