import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { NotesList } from "./src/components/ui/notes-list";
import { PressableButton } from "./src/components/ui/pressable-button";
import { notesStore } from "./src/stores/notes.store";

export default observer(function NotesListScreen() {
    if (!notesStore.isHydrated) return <Text style={{ padding: 16 }}>Loading…</Text>;

    return (
        <View style={styles.container}>
            <TextInput
                value={notesStore.searchQuery}
                onChangeText={notesStore.setSearchQuery}
                placeholder="Search notes…"
                autoCapitalize="none"
                clearButtonMode="while-editing"
                style={styles.search}
            />
            <View style={styles.addBtn}>
                <PressableButton
                    title="+ New note"
                    onPress={() => router.push("/notes/new")}
                />
            </View>
            <NotesList />

        </View>
    );
});


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    addBtn: {
        paddingHorizontal: 16,
    },
    search: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 16,
        margin: 16
    }
});
