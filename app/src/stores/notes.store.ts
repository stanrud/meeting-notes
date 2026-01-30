import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeAutoObservable, runInAction } from "mobx";
import type { Note, NoteTemplateId, StructuredMeeting } from "../models/types";

const STORAGE_KEY = "meeting-notes:v1";

export class NotesStore {
    notes: Note[] = [];
    isHydrated = false;
    searchQuery = '';

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get sortedNotes() {
        return [...this.notes].sort((a, b) => b.createdAt - a.createdAt);
    }

    get filteredNotes() {
        const q = this.searchQuery.trim().toLowerCase();
        if (!q) return this.sortedNotes;

        return this.sortedNotes.filter((n) =>
            (n.rawText ?? "").toLowerCase().includes(q)
        );
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

    setSearchQuery(q: string) {
        this.searchQuery = q;
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

    setDictationText(id: string, text: string) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        note.dictationText = text;
    }

    commitDictation(id: string) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        const chunk = (note.dictationText ?? '').trim();
        if (!chunk) return;
        const needsSep = note.rawText.trim().length > 0;
        note.rawText = needsSep ? `${note.rawText}\n${chunk}` : chunk;
        note.dictationText = '';
        void this.persist();
    }

    clearDictation(id: string) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        note.dictationText = '';
    }

    appendTranscriptDelta(id: string, fullTranscript: string) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        const next = (fullTranscript ?? "").trim();
        if (!next) return;
        const prev = (note.lastTranscript ?? "").trim();
        if (!prev) {
            note.lastTranscript = next;
            return;
        }
        if (next.startsWith(prev)) {
            const delta = next.slice(prev.length).trimStart();
            if (delta) {
                const needsSpace = note.rawText.length && !note.rawText.endsWith("\n");
                note.rawText = note.rawText + (needsSpace ? ' ' : '') + delta;
            }
        } else {
            note.rawText = note.rawText.trim().length ? `${note.rawText}\n${next}` : next;
        }
        note.lastTranscript = next;
        void this.persist();
    }

    setStructured(id: string, templateId: NoteTemplateId, structured: StructuredMeeting) {
        this.updateNote(id, { templateId, structured });
    }
}

export const notesStore = new NotesStore();