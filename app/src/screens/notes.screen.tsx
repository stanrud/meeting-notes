import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotesList from "../components/ui/notes-list";
import PressableButton from "../components/ui/pressable-button";
import { notesStore } from "../stores/notes.store";

export default observer(function NotesListScreen() {
    if (!notesStore.isHydrated) return <Text style={{ padding: 16 }}>Loading…</Text>;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Meeting Notes</Text>
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
        </SafeAreaView>
    );
});


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 28,
        fontWeight: '800'
    },
    addBtn: {
        paddingHorizontal: 16,
    },
    search: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 16,
        margin: 16
    }
});
