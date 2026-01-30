import type { NoteTemplateId } from "../models/types";

export const templates: { id: NoteTemplateId; title: string; promptHint: string }[] = [
  {
    id: "standard",
    title: "Standard meeting",
    promptHint:
      "Extract participants, key points, decisions, and todos. Todos should be actionable and concise.",
  },
  {
    id: "oneOnOne",
    title: "1:1 meeting",
    promptHint:
      "Extract participants, key discussion points, and todos. Keep it practical, with clear next steps.",
  },
];