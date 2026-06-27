import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

type Answer = { id: string; label: string; value: string };
type Step = { key: "species" | "home" | "energy"; q: string; options: Answer[] };

const STEPS: Step[] = [
  {
    key: "species",
    q: "Are you leaning cat or dog?",
    options: [
      { id: "cat", label: "🐱 Cat", value: "cat" },
      { id: "dog", label: "🐶 Dog", value: "dog" },
      { id: "either", label: "✨ Either", value: "either" },
    ],
  },
  {
    key: "home",
    q: "Where will they live?",
    options: [
      { id: "apt", label: "🏙️ Apartment", value: "a cozy apartment" },
      { id: "house", label: "🏡 House with yard", value: "a house with a yard" },
      { id: "shared", label: "👨‍👩‍👧 Family home with kids", value: "a busy family home with kids" },
    ],
  },
  {
    key: "energy",
    q: "Your daily energy?",
    options: [
      { id: "calm", label: "🛋️ Chill & cozy", value: "low" },
      { id: "balanced", label: "🚶 Walks & play", value: "medium" },
      { id: "active", label: "🏃 Very active", value: "high" },
    ],
  },
];

export function QuickMatchQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  function pick(value: string) {
    const key = STEPS[step].key;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const lifestyle = `I live in ${next.home}. My energy is ${next.energy}. Looking for a ${next.species === "either" ? "pet" : next.species}.`;
      try {
        sessionStorage.setItem(
          "pawverse:quickmatch",
          JSON.stringify({ lifestyle, species: next.species === "either" ? "all" : next.species }),
        );
      } catch {}
      navigate({ to: "/cats" });
    }
  }

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" /> Quick-match quiz
        </div>
        <span className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary/40">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl">{current.q}</h3>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {current.options.map((o) => (
          <button
            key={o.id}
            onClick={() => pick(o.value)}
            className="group rounded-2xl border border-border bg-card/70 p-4 text-left transition hover:border-primary hover:bg-accent/40 hover:shadow-md"
          >
            <div className="text-2xl">{o.label.split(" ")[0]}</div>
            <div className="mt-1 flex items-center justify-between text-sm font-semibold">
              <span>{o.label.replace(/^\S+\s/, "")}</span>
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
