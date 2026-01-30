import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet, Text, View } from "react-native";
import { NotesList } from "./src/components/ui/notes-list";
import { PressableButton } from "./src/components/ui/pressable-button";
import { notesStore } from "./src/stores/notes.store";

export default observer(function NotesListScreen() {
    if (!notesStore.isHydrated) return <Text style={{ padding: 16 }}>Loading…</Text>;

    return (
        <View style={styles.container}>
            <NotesList />
            <View style={styles.content}>
                <PressableButton
                    title="+ New note"
                    onPress={() => router.push("/notes/new")}
                />
            </View>
        </View>
    );
});


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 16,
    },
});
