import type { NoteTemplateId, StructuredMeeting } from "../models/types";
import { schemaForTemplate } from "./ai-schemas";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const MODEL = "gpt-4.1-mini";


export async function applyTemplateWithOpenAI(args: {
    rawText: string;
    templateId: NoteTemplateId;
    templateHint: string;
}): Promise<StructuredMeeting> {
    if (!OPENAI_API_KEY) throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY");
    const template = schemaForTemplate(args.templateId);

    const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: MODEL,
            input: [
                { role: "system", content: "You format messy meeting notes into a structured JSON object..." },
                { role: "user", content: `TEMPLATE INSTRUCTIONS:\n${args.templateHint}\n\nRAW NOTES:\n${args.rawText}` },
            ],
            text: {
                format: {
                    type: "json_schema",
                    name: template.name,
                    strict: template.strict,
                    schema: template.schema,
                },
            },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    const json = await res.json();
    const outputText: string =
        json.output_text ??
        json.output?.[0]?.content?.[0]?.text ??
        "";

    return JSON.parse(outputText) as StructuredMeeting;
}