import { MoodSchema, PRIMARY_EMOTIONS, VALENCES, SERIOSITIES } from "./mood.types.js";
export async function analyseDiaryMood(openai, diaryText) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
            {
                role: "system",
                content: `
                    You are an assistant that analyses diary entries to inspire the creation of symbolic "mood garden" images.
                    Your task is to interpret the emotional tone, atmosphere, and symbolism expressed in the text, and describe it as structured data in JSON format.
                    DEFINITIONS:
                        • intensity — how strongly the main emotion is experienced. 1 = The diary entry is mostly factual and contains little direct expression of emotion. 3 = The main emotion of the diary entry is clearly expressed. 5 = The main emotion is very strong.
                        • color_palette — colors that could visually represent the feeling.
                        • symbolic_elements — Avoid literal objects that represent things mentioned in the diary entry. Objects should symobolise the emotions, or be metaphorical. No people. No reference to weather, plans or trees.
                        • earnestness — Represents the tone of the diary entry. low = the entry is sarcastic, silly or whimsical; high = The diary entry is very earnest; Medium = Anywhere between.
                        
                    The others should be self explanatory.

                    Follow these rules strictly:
                    - Output ONLY valid JSON matching the provided schema.
                    - Do not include any explanations, comments, or text outside the JSON.
                    - Base all values on the diary’s emotional content — not literal keywords.
                    - The data will later be used to generate a visual garden scene that represents the diary’s mood.

                    Be creative but coherent, and ensure the chosen emotions, colours, and symbols fit the described feelings.
                    `
            },
            { role: "user", content: diaryText },
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "MoodAnalysis",
                strict: true,
                schema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["primary_emotion", "secondary_emotions", "valence", "intensity", "earnestness", "short_theme", "color_palette", "symbolic_elements"],
                    properties: {
                        primary_emotion: { type: "string", enum: [...PRIMARY_EMOTIONS] },
                        secondary_emotions: { type: "array", items: { type: "string" } },
                        valence: { type: "string", enum: [...VALENCES] },
                        intensity: { type: "integer", minimum: 1, maximum: 5 },
                        earnestness: { type: "string", enum: [...SERIOSITIES] },
                        short_theme: { type: "string" },
                        color_palette: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 5 },
                        symbolic_elements: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
                    },
                },
            },
        },
    });
    const json = res.choices[0]?.message?.content;
    if (!json)
        throw new Error("No content returned from model");
    return MoodSchema.parse(JSON.parse(json));
}
