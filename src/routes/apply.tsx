import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";

type Search = { catId?: string; type?: "adoption" | "foster" };

export const Route = createFileRoute("/apply")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    catId: typeof s.catId === "string" ? s.catId : undefined,
    type: s.type === "foster" ? "foster" : "adoption",
  }),
  component: ApplyPage,
});

const schema = z.object({
  applicant_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(500),
  home_type: z.string().min(1),
  has_other_pets: z.boolean(),
  has_kids: z.boolean(),
  experience: z.string().max(1000),
  why_adopt: z.string().min(10).max(1500),
});

function ApplyPage() {
  const { catId, type } = Route.useSearch();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [cat, setCat] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    applicant_name: "", email: "", phone: "", address: "",
    home_type: "apartment", has_other_pets: false, has_kids: false,
    experience: "", why_adopt: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        setForm((f) => ({ ...f, email: data.user!.email ?? "" }));
      }
    });
    if (catId) {
      supabase.from("cats").select("id,name").eq("id", catId).maybeSingle().then(({ data }) => setCat(data));
    }
  }, [catId]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-8">
            <div className="text-5xl">🐾</div>
            <h1 className="mt-3 text-2xl font-bold">Sign in to apply</h1>
            <p className="mt-2 text-sm text-muted-foreground">We need a quick sign-in to track your application.</p>
            <Button asChild className="mt-5 rounded-full"><Link to="/auth">Sign in to continue</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("adoption_applications").insert({
      user_id: user!.id,
      cat_id: catId ?? null,
      application_type: type ?? "adoption",
      ...parsed.data,
      phone: parsed.data.phone || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Application submitted! We'll be in touch soon. 🐾");
    navigate({ to: "/cats" });
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-4xl font-bold">
          {type === "foster" ? "Foster" : "Adoption"} application
          {cat && <span className="block text-xl font-normal text-muted-foreground">for {cat.name}</span>}
        </h1>

        <form onSubmit={submit} className="glass-card mt-8 space-y-5 rounded-3xl p-6">
          <Field label="Your full name" v={form.applicant_name} onChange={(v) => setForm({ ...form, applicant_name: v })} />
          <Field label="Email" v={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Field label="Phone (optional)" v={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <Label>Address</Label>
            <Textarea className="mt-1.5" maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Home type</Label>
            <select className="mt-1.5 w-full rounded-md border bg-card px-3 py-2 text-sm" value={form.home_type} onChange={(e) => setForm({ ...form, home_type: e.target.value })}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="shared">Shared housing</option>
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.has_other_pets} onCheckedChange={(v) => setForm({ ...form, has_other_pets: !!v })} /> Other pets at home</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.has_kids} onCheckedChange={(v) => setForm({ ...form, has_kids: !!v })} /> Kids at home</label>
          </div>
          <div>
            <Label>Cat experience</Label>
            <Textarea className="mt-1.5" maxLength={1000} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Have you had cats before?" />
          </div>
          <div>
            <Label>Why do you want to {type === "foster" ? "foster" : "adopt"}?</Label>
            <Textarea className="mt-1.5" maxLength={1500} value={form.why_adopt} onChange={(e) => setForm({ ...form, why_adopt: e.target.value })} placeholder="Tell us a bit about your hopes and home…" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-primary py-6 text-base">
            {submitting ? "Submitting…" : "Submit application 🐾"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Need help? <Link to="/chat" className="text-primary hover:underline">Ask Mittens</Link></p>
        </form>
      </main>
    </div>
  );
}

function Field({ label, v, onChange, type = "text" }: { label: string; v: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" type={type} value={v} onChange={(e) => onChange(e.target.value)} maxLength={255} />
    </div>
  );
}
