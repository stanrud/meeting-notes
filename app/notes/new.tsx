import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { notesStore } from "../src/stores/notes.store";

export default function NewNoteScreen() {
    const [title, setTitle] = useState("New meeting");

    const onCreateNewNote = () => {
        const note = notesStore.createNote({ title });
        router.replace({ pathname: "/notes/[id]", params: { id: note.id } });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.smallText}>Title</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.textInput}
            />
            <Pressable
                onPress={() => onCreateNewNote()}
                style={styles.pressableBtn}
            >
                <Text style={styles.smallText}>Create</Text>
            </Pressable>
        </View>
    );
}

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
    smallText: {
        fontWeight: "600",
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
    },
    pressableBtn: {
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: "center"
    },
});