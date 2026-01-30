import { Stack } from "expo-router";
import { useEffect } from "react";
import { notesStore } from "./src/stores/notes.store";

export default function RootLayout() {
    useEffect(() => {
        notesStore.hydrate();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Meeting Notes" }} />
            <Stack.Screen name="notes/new" options={{ title: "New Note" }} />
            <Stack.Screen name="notes/[id]" options={{ title: "Note" }} />
        </Stack>
    );
}