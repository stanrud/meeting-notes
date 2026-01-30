import { Stack } from "expo-router";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { notesStore } from "./src/stores/notes.store";

export default function RootLayout() {
    useEffect(() => {
        notesStore.hydrate();
    }, []);

    return (
        <KeyboardProvider>
            <Stack>
                <Stack.Screen name="index" options={{ title: "Meeting Notes", headerShown: false }} />
                <Stack.Screen name="notes/new" options={{ title: "New Note" }} />
                <Stack.Screen name="notes/[id]" options={{ title: "Note" }} />
            </Stack>
        </KeyboardProvider>
    );
}