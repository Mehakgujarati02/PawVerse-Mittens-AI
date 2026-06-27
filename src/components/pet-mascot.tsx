import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, MessageCircle } from "lucide-react";

const TIPS = [
  "Tell me about your home and I'll find your perfect match! 🏡",
  "Pro tip: fosters can become forever homes 💛",
  "All our pets are vet-checked and ready to love 🩺",
  "Try the quick-match quiz on the home page ✨",
  "Adoption usually takes about 12 minutes here ⏱️",
  "Cat or dog? I can help you decide — just ask! 🐱🐶",
];

export function PetMascot() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(TIPS[0]);
  const [wave, setWave] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setWave((w) => !w), 4500);
    return () => clearInterval(t);
  }, []);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
      return next;
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="glass-card max-w-[260px] rounded-2xl rounded-br-sm p-4 text-sm shadow-lg"
          style={{ animation: "scale-in 0.18s ease-out" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="font-display font-bold text-primary">Mittens</div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 leading-snug text-foreground">{tip}</p>
          <Link
            to="/chat"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="h-3 w-3" /> Chat with me
          </Link>
        </div>
      )}
      <button
        onClick={toggle}
        aria-label="Open Mittens helper"
        className="grid h-16 w-16 place-items-center rounded-full bg-primary text-3xl text-primary-foreground shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{ animation: wave ? "mascot-wave 0.9s ease-in-out" : undefined }}
      >
        🐱
      </button>
    </div>
  );
}
