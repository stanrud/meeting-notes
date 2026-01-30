import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeAutoObservable, runInAction } from "mobx";
import type { Note, NoteTemplateId, StructuredMeeting } from "../models/types";

const STORAGE_KEY = "meeting-notes:v1";

export class NotesStore {
    notes: Note[] = [];
    isHydrated = false;

    constructor() {
        makeAutoObservable(this);
    }

    get sortedNotes() {
        return [...this.notes].sort((a, b) => b.createdAt - a.createdAt);
    }

    async hydrate() {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        runInAction(() => {
            this.notes = raw ? JSON.parse(raw) : [];
            this.isHydrated = true;
        });
    }

    private async persist() {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
    }

    createNote(initial?: Partial<Note>) {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const note: Note = {
            id,
            title: initial?.title ?? "New meeting",
            rawText: initial?.rawText ?? "",
            createdAt: Date.now(),
            templateId: initial?.templateId,
            structured: initial?.structured,
        };
        this.notes.unshift(note);
        void this.persist();
        return note;
    }

    updateNote(id: string, patch: Partial<Note>) {
        const idx = this.notes.findIndex(n => n.id === id);
        if (idx < 0) return;
        this.notes[idx] = { ...this.notes[idx], ...patch };
        void this.persist();
    }

    appendRawText(id: string, text: string) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        const sep = note.rawText.trim().length ? "\n" : "";
        note.rawText = `${note.rawText}${sep}${text}`;
        void this.persist();
    }

    setStructured(id: string, templateId: NoteTemplateId, structured: StructuredMeeting) {
        this.updateNote(id, { templateId, structured });
    }
}

export const notesStore = new NotesStore();