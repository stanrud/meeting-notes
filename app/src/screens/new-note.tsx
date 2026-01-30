import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { notesStore } from "../stores/notes.store";

export default function NewNoteScreen() {
    const [title, setTitle] = useState("New meeting");

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontWeight: "600" }}>Title</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
            />

            <Pressable
                onPress={() => {
                    const note = notesStore.createNote({ title });
                    router.replace({ pathname: "/notes/[id]", params: { id: note.id } });
                }}
                style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
            >
                <Text style={{ fontWeight: "600" }}>Create</Text>
            </Pressable>
        </View>
    );
}