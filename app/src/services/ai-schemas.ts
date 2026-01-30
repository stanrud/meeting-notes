import { NoteTemplateId } from "../models/types";

export const schemaForTemplate = (templateId: NoteTemplateId) => {
    const base = {
        type: "object" as const,
        additionalProperties: false,
    };

    if (templateId === "standard") {
        return {
            name: "meeting_notes_standard",
            strict: true,
            schema: {
                ...base,
                properties: {
                    templateId: { type: "string", enum: ["standard"] },
                    participants: { type: "array", items: { type: "string" } },
                    keyPoints: { type: "array", items: { type: "string" } },
                    decisions: { type: "array", items: { type: "string" } },
                    todos: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                text: { type: "string" },
                            },
                            required: ["text"],
                        },
                    },
                },
                required: ["templateId", "participants", "keyPoints", "decisions", "todos"],
            },
        };
    }

    return {
        name: "meeting_notes_one_on_one",
        strict: true,
        schema: {
            ...base,
            properties: {
                templateId: { type: "string", enum: ["oneOnOne"] },
                participants: { type: "array", items: { type: "string" } },
                discussionPoints: { type: "array", items: { type: "string" } },
                todos: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            text: { type: "string" },
                        },
                        required: ["text"],
                    },
                },
            },
            required: ["templateId", "participants", "discussionPoints", "todos"],
        },
    };
}