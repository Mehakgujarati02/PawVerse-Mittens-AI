import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, catContext } = (await request.json()) as {
          messages?: unknown;
          catContext?: string;
        };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = `You are Mittens, the warm and knowledgeable AI adoption counselor for PawVerse — a cat and dog adoption and foster platform.

Your job:
- Help adopters decide if adopting (or fostering) a cat or dog is right for them.
- Recommend pets from our database based on their lifestyle, home, experience, and preferences. Be thoughtful about cat vs dog fit.
- Walk them through the adoption application step by step.
- Answer questions about pet care, vet costs, introducing pets to new homes, kids, and other pets.
- Be honest about responsibilities; never pressure anyone into adopting.

Tone: warm, gently witty, never condescending. Use the occasional 🐾 emoji sparingly. Keep replies concise (2–5 short paragraphs) and use bullet lists when comparing options.

${catContext ? `\nCurrent pet the user is viewing:\n${catContext}\n` : ""}`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
