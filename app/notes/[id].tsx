import { useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { applyTemplateWithOpenAI } from "../src/services/openai.service";
import { requestSpeechPermissions, startListening } from "../src/services/speech.service";
import { templates } from "../src/services/templates";
import { notesStore } from "../src/stores/notes.store";

function Section({ title, items }: { title: string; items: string[] }) {
    return (
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>{title}</Text>
            {items?.length ? items.map((x, i) => <Text key={i} style={{ marginTop: 4 }}>{x}</Text>) : <Text style={{ opacity: 0.7 }}>—</Text>}
        </View>
    );
}

export default observer(function NoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const note = useMemo(() => notesStore.notes.find(n => n.id === id), [id]);

    const [isListening, setIsListening] = useState(false);
    const [stopListening, setStopListening] = useState<null | (() => void)>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);

    if (!note) return <Text style={{ padding: 16 }}>Not found</Text>;

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)!;

    async function onToggleListen() {
        if (isListening) {
            stopListening?.();
            setStopListening(null);
            setIsListening(false);
            return;
        }

        await requestSpeechPermissions();
        const stop = startListening((chunk) => {
            notesStore.appendRawText(note!.id, chunk);
        });

        setStopListening(() => stop);
        setIsListening(true);
    }

    async function onApplyTemplate() {
        setIsApplying(true);
        try {
            const structured = await applyTemplateWithOpenAI({
                rawText: note!.rawText,
                templateId: selectedTemplateId,
                templateHint: selectedTemplate.promptHint,
            });
            notesStore.setStructured(note!.id, selectedTemplateId, structured);
        } finally {
            setIsApplying(false);
        }
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>{note.title}</Text>

            <Text style={{ fontWeight: "600" }}>Raw notes</Text>
            <TextInput
                value={note.rawText}
                onChangeText={(t) => notesStore.updateNote(note.id, { rawText: t })}
                multiline
                style={{ borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 140 }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                    onPress={onToggleListen}
                    style={{ padding: 12, borderWidth: 1, borderRadius: 12, flex: 1, alignItems: "center" }}
                >
                    <Text style={{ fontWeight: "600" }}>
                        {isListening ? "Stop 🎙️" : "Voice input 🎙️"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onApplyTemplate}
                    disabled={isApplying}
                    style={{ padding: 12, borderWidth: 1, borderRadius: 12, flex: 1, alignItems: "center" }}
                >
                    <Text style={{ fontWeight: "600" }}>
                        {isApplying ? "Applying…" : "Apply template"}
                    </Text>
                </Pressable>
            </View>

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {templates.map(t => (
                    <Pressable
                        key={t.id}
                        onPress={() => setSelectedTemplateId(t.id)}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 999,
                            opacity: selectedTemplateId === t.id ? 1 : 0.6,
                        }}
                    >
                        <Text>{t.title}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={{ fontWeight: "700", marginTop: 8 }}>Structured output</Text>
            {!note.structured ? (
                <Text style={{ opacity: 0.7 }}>Apply a template to see structured sections.</Text>
            ) : (
                <View style={{ gap: 10 }}>
                    <Section title="Participants" items={note.structured.participants} />
                    <Section title="Key points" items={note.structured.keyPoints} />
                    <Section
                        title="Todos"
                        items={note.structured.todos.map(t => `• ${t.text}${t.owner ? ` (owner: ${t.owner})` : ""}${t.due ? ` (due: ${t.due})` : ""}`)}
                    />
                    {note.structured.decisions?.length ? (
                        <Section title="Decisions" items={note.structured.decisions} />
                    ) : null}
                </View>
            )}
        </View>
    );
});
