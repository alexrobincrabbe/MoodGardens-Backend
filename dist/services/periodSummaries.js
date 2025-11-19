// apps/api/src/services/periodSummaries.ts
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
async function summariseFromSummaries(label, summaries) {
    if (!summaries.length) {
        throw new Error(`No summaries provided for ${label} summarisation`);
    }
    const combined = summaries.join("\n\n---\n\n");
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
            {
                role: "system",
                content: `
You are an assistant that creates reflective emotional overviews of longer time periods 
(weeks, months, or years) based on shorter summaries.
Write in the second person ("you"), and keep a warm, calm tone. 
Return a concise but rich paragraph (or two) that describes the emotional arc, themes, and tone 
across the whole ${label.toLowerCase()}.
        `.trim(),
            },
            {
                role: "user",
                content: `
Here are the component summaries for this ${label.toLowerCase()}:

${combined}

Please write a single coherent summary for the entire ${label.toLowerCase()}.
        `.trim(),
            },
        ],
    });
    const text = res.choices[0]?.message?.content?.trim();
    if (!text) {
        throw new Error(`OpenAI did not return a summary for ${label}`);
    }
    return text;
}
export async function summariseMonthFromWeeks(weeklySummaries) {
    return summariseFromSummaries("Month", weeklySummaries);
}
export async function summariseYearFromMonths(monthlySummaries) {
    return summariseFromSummaries("Year", monthlySummaries);
}
