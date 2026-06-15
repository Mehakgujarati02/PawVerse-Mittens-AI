import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Search = { catId?: string };

export const Route = createFileRoute("/chat")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    catId: typeof s.catId === "string" ? s.catId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mittens — your AI adoption counselor | MyMeow" },
      { name: "description", content: "Chat with Mittens, our AI cat-adoption counselor. Get matched, ask questions, prepare your home." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { catId } = Route.useSearch();
  const [catContext, setCatContext] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!catId) return;
    supabase.from("cats").select("name,age_years,breed,description,personality,energy_level,good_with_kids,good_with_pets").eq("id", catId).maybeSingle().then(({ data }) => {
      if (data) setCatContext(JSON.stringify(data));
    });
  }, [catId]);

  const transport = useRef(new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: { messages, catContext, ...body },
    }),
  })).current;

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => console.error(e),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text });
  }

  const suggestions = [
    "I live in an apartment with one toddler. What cats fit us?",
    "What does fostering actually cost me?",
    "How do I introduce a new cat to my resident dog?",
    "Help me decide between adopting and fostering first.",
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-2xl text-primary-foreground">🐾</div>
          <div>
            <h1 className="font-display text-3xl font-bold">Mittens</h1>
            <p className="text-sm text-muted-foreground">Your AI adoption counselor · here 24/7</p>
          </div>
        </div>

        <div ref={scrollRef} className="glass-card max-h-[60vh] min-h-[40vh] space-y-4 overflow-y-auto rounded-3xl p-5">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-accent/40 p-4 text-sm">
                Hi! I'm Mittens 🐾 — ask me anything about adopting or fostering a cat. I can also match cats to your lifestyle.
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage({ text: s })} className="rounded-full border border-primary/30 bg-card/70 px-3 py-1.5 text-xs hover:bg-secondary/50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                  {isUser ? text : <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5"><ReactMarkdown>{text}</ReactMarkdown></div>}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5 animate-pulse" /> Mittens is thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSend} className="mt-4 flex gap-2">
          <Input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a cat, fostering, costs, kids…" className="rounded-full bg-card" disabled={isLoading} />
          <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full bg-primary"><Send className="h-4 w-4" /></Button>
        </form>
        <p className="mt-3 text-center text-xs text-muted-foreground">Want to apply? <Link to="/cats" className="text-primary hover:underline">Browse cats</Link></p>
      </main>
    </div>
  );
}
