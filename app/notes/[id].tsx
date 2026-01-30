import { useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
    const note = notesStore.notes.find(n => n.id === id);

    const [isListening, setIsListening] = useState(false);
    const [stopListening, setStopListening] = useState<null | (() => void)>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);

    if (!note) return <Text style={{ padding: 16 }}>Not found</Text>;

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)!;

    async function onToggleListen() {
        if (!note) return;
        if (isListening) {
            try {
                stopListening?.();
            } finally {
                setStopListening(null);
                setIsListening(false);
                notesStore.commitDictation(note.id);
            }
            return;
        }
        const perm = await requestSpeechPermissions();
        if (perm && 'granted' in perm && !perm.granted) {
            return;
        }
        notesStore.clearDictation(note.id);
        const stop = startListening((transcript: string) => {
            notesStore.setDictationText(note.id, transcript);
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

    const editorValue = isListening && note.dictationText?.trim()
        ? `${note.rawText}${note.rawText.trim() ? "\n" : ""}${note.dictationText}`
        : note.rawText;

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView
                behavior={"padding"}
                keyboardVerticalOffset={100}
                style={styles.content}
            >
                <Text style={styles.text}>{note.title}</Text>
                <Text style={styles.smallText}>Raw notes</Text>
                <TextInput
                    value={editorValue}
                    style={styles.textInput}
                    onChangeText={(t) => notesStore.updateNote(note.id, { rawText: t })}
                    editable={!isListening}
                    multiline
                />
                <View style={styles.voiceBtn}>
                    <Pressable
                        onPress={onToggleListen}
                        style={styles.pressableBtn}
                    >
                        <Text style={styles.smallText}>
                            {isListening ? "Stop 🎙️" : "Voice input 🎙️"}
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={onApplyTemplate}
                        disabled={isApplying || isListening}
                        style={styles.pressableBtn}
                    >
                        <Text style={styles.smallText}>
                            {isApplying ? "Applying…" : "Apply template"}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.templatesContainer}>
                    {templates.map(t => (
                        <Pressable
                            key={t.id}
                            onPress={() => setSelectedTemplateId(t.id)}
                            style={{ ...styles.templatesList, opacity: selectedTemplateId === t.id ? 1 : 0.6 }}
                        >
                            <Text>{t.title}</Text>
                        </Pressable>
                    ))}
                </View>
                <Text style={styles.text}>Structured output</Text>
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
                        {note.structured.decisions?.length && <Section title="Decisions" items={note.structured.decisions} />}
                    </View>
                )}
            </KeyboardAvoidingView>
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12
    },
    content: {
        flex: 1,
        gap: 4
    },
    text: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 8
    },
    smallText: { fontWeight: "600" },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 140,
        maxHeight: 300
    },
    voiceBtn: {
        flexDirection: "row",
        gap: 10
    },
    pressableBtn: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: "center"
    },
    templatesContainer: {
        gap: 8,
        flexWrap: "wrap",
        flexDirection: "row",
    },
    templatesList: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 999,
    }
});
