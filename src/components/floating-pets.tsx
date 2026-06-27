import { useEffect, useState } from "react";

type Pet = {
  id: number;
  emoji: string;
  action: string;
  top: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
  flip: boolean;
  animation: string;
};

const PETS = [
  { emoji: "🐱", actions: ["plays with yarn 🧶", "naps 😴", "chases a butterfly 🦋", "purrs", "stretches"] },
  { emoji: "🐶", actions: ["fetches a ball ⚾", "wags tail", "chases a stick 🦴", "rolls over", "barks happily"] },
  { emoji: "🐈", actions: ["pounces!", "grooms", "watches birds 🐦"] },
  { emoji: "🐕", actions: ["sniffs around", "naps in the sun ☀️", "wants belly rubs"] },
  { emoji: "🐾", actions: [""] },
];

const ANIMATIONS = ["pet-float", "pet-bounce", "pet-wobble", "pet-drift"];

function randomPet(id: number): Pet {
  const p = PETS[Math.floor(Math.random() * PETS.length)];
  const action = p.actions[Math.floor(Math.random() * p.actions.length)];
  return {
    id,
    emoji: p.emoji,
    action,
    top: Math.random() * 80 + 5,
    left: Math.random() * 90 + 2,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 6,
    scale: 0.8 + Math.random() * 0.7,
    flip: Math.random() > 0.5,
    animation: ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)],
  };
}

export function FloatingPets({ count = 6 }: { count?: number }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setPets(Array.from({ length: count }, (_, i) => randomPet(i)));
    const t = setInterval(() => {
      setPets((prev) => prev.map((p) => (Math.random() > 0.7 ? randomPet(p.id) : p)));
    }, 9000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {pets.map((p) => (
        <div
          key={p.id}
          className="pointer-events-auto absolute select-none opacity-60 transition-opacity hover:opacity-100"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            animation: `${p.animation} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            transform: `scale(${p.scale}) ${p.flip ? "scaleX(-1)" : ""}`,
            fontSize: "2.25rem",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))",
          }}
          onMouseEnter={() => setHovered(p.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <span>{p.emoji}</span>
          {hovered === p.id && p.action && (
            <span
              className="absolute left-1/2 -top-7 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-md"
              style={{ transform: `translateX(-50%) ${p.flip ? "scaleX(-1)" : ""}` }}
            >
              {p.action}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
