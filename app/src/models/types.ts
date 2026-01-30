export type NoteTemplateId = "standard" | "oneOnOne";

export type StructuredMeeting = {
  participants: string[];
  keyPoints: string[];
  todos: { text: string; owner?: string; due?: string }[];
  decisions?: string[];
};

export type Note = {
  id: string;
  title: string;
  rawText: string;
  createdAt: number;

  templateId?: NoteTemplateId;
  structured?: StructuredMeeting;
};