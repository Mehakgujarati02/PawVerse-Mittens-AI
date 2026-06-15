import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MatchInput = z.object({
  lifestyle: z.string().min(1).max(2000),
  hasKids: z.boolean().optional(),
  hasOtherPets: z.boolean().optional(),
  energyPreference: z.string().optional(),
});

export const matchCats = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cats, error } = await supabaseAdmin
      .from("cats")
      .select("id,name,age_years,gender,breed,description,personality,good_with_kids,good_with_pets,energy_level")
      .eq("status", "available");
    if (error) throw new Error(error.message);

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are matching adopters to cats. Pick the top 3 cats from the list below that best fit the adopter, ranked best first.

Adopter:
- Lifestyle/home description: ${data.lifestyle}
- Has kids: ${data.hasKids ?? "unknown"}
- Has other pets: ${data.hasOtherPets ?? "unknown"}
- Energy preference: ${data.energyPreference ?? "any"}

Available cats (JSON):
${JSON.stringify(cats, null, 2)}

Return your top 3 matches with a 1-sentence warm reason for each.`;

    const { output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          matches: z.array(z.object({
            catId: z.string(),
            name: z.string(),
            reason: z.string(),
            score: z.number().min(0).max(100),
          })).max(3),
        }),
      }),
      prompt,
    });
    return output;
  });

const IntakeInput = z.object({
  name: z.string().min(1).max(80),
  age_years: z.number().min(0).max(30),
  gender: z.string().min(1).max(20),
  breed: z.string().max(80).optional(),
  color: z.string().max(80).optional(),
  notes: z.string().max(4000),
});

export const generateIntakeDoc = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IntakeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `Write an adoption listing for a shelter intake. Be warm, honest, specific, 80-120 words. Then extract structured tags.

Cat:
- Name: ${data.name}
- Age (years): ${data.age_years}
- Gender: ${data.gender}
- Breed: ${data.breed ?? "unknown"}
- Color: ${data.color ?? "unknown"}
- Intake notes (raw): ${data.notes}`;

    const { output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          description: z.string(),
          personality: z.array(z.string()).max(6),
          energy_level: z.enum(["low", "medium", "high"]),
          good_with_kids: z.boolean(),
          good_with_pets: z.boolean(),
        }),
      }),
      prompt,
    });
    return output;
  });
