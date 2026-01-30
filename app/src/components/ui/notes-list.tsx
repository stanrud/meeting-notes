import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { notesStore } from '../../stores/notes.store';

export const NotesList = observer(() => {

    const onPressNote = (itemId: string) => {
        router.push({ pathname: "/notes/[id]", params: { id: itemId } });
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notesStore.filteredNotes}
                keyExtractor={(n) => n.id}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => onPressNote(item.id)}
                        style={styles.button}
                    >
                        <Text style={styles.text}>{item.title}</Text>
                        <Text numberOfLines={2} style={styles.noText}>
                            {item.rawText || "No text yet…"}
                        </Text>
                    </Pressable>
                )}
            />
        </View>

    );
});

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    content: {
        paddingVertical: 22,
        gap: 12
    },
    text: {
        fontSize: 16,
        fontWeight: "600"
    },
    noText: {
        opacity: 0.7,
        marginTop: 6
    },
    button: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 12
    },
});
