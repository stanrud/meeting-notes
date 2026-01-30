import { useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { PressableButton } from "../src/components/ui/pressable-button";
import { Section } from "../src/components/ui/section";
import { formatTodo } from "../src/helpers/string.helper";
import { applyTemplateWithOpenAI } from "../src/services/openai.service";
import { requestSpeechPermissions, startListening } from "../src/services/speech.service";
import { templates } from "../src/services/templates";
import { notesStore } from "../src/stores/notes.store";

const NoteDetailScreen = observer(() => {
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

    const renderStructuredOutput = () => {
        return (
            <>
                <Text style={styles.text}>Structured output</Text>
                {!note.structured ? (
                    <Text style={styles.hint}>Apply a template to see structured sections.</Text>
                ) : (
                    <View style={styles.content}>
                        <Section title="Participants" items={note.structured.participants ?? []} />
                        <Section title="Key points" items={note.structured.keyPoints ?? []} />
                        <Section
                            title="Todos"
                            items={note.structured.todos.map(formatTodo)}
                        />
                        {!!note.structured.decisions?.length ? <Section title="Decisions" items={note.structured.decisions} /> : null}
                    </View>
                )}
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={"padding"}
            keyboardVerticalOffset={100}
            style={styles.container}
        >
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.text}>{note.title}</Text>
                <Text style={styles.smallText}>Raw notes</Text>
                <TextInput
                    value={editorValue}
                    style={styles.textInput}
                    onChangeText={(t) => notesStore.updateNote(note.id, { rawText: t })}
                    editable={!isListening}
                    multiline
                />
                <View style={styles.buttonsContainer}>
                    <PressableButton
                        title={isListening ? "Stop 🎙️" : "Voice input 🎙️"}
                        onPress={onToggleListen}
                    />
                    <PressableButton
                        title={isApplying ? "Applying…" : "Apply template"}
                        onPress={onApplyTemplate}
                        disabled={note.rawText.length === 0 || isApplying || isListening}
                    />
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
                {renderStructuredOutput()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
});

export default NoteDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        flex: 1,
        gap: 12
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
        height: 220,
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 10,
        paddingVertical: 12,
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
    },
    hint: { opacity: 0.7 }
});
