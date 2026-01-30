import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { FlatList, Pressable, Text, View } from "react-native";
import { notesStore } from "./src/stores/notes.store";

export default observer(function NotesListScreen() {
    if (!notesStore.isHydrated) return <Text style={{ padding: 16 }}>Loading…</Text>;

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={notesStore.sortedNotes}
                keyExtractor={(n) => n.id}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push({ pathname: "/notes/[id]", params: { id: item.id } })}
                        style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
                        <Text numberOfLines={2} style={{ opacity: 0.7, marginTop: 6 }}>
                            {item.rawText || "No text yet…"}
                        </Text>
                    </Pressable>
                )}
            />
            <View style={{ padding: 16 }}>
                <Pressable
                    onPress={() => router.push("/notes/new")}
                    style={{ padding: 14, borderWidth: 1, borderRadius: 999, alignItems: "center" }}
                >
                    <Text style={{ fontWeight: "600" }}>+ New note</Text>
                </Pressable>
            </View>
        </View>
    );
});