import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SectionProps = {
    title: string;
    items: string[];
};

export const Section = ({ title, items }: SectionProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
            {items?.length ? items.map((x, i) => <Text key={i} style={{ marginTop: 4 }}>{x}</Text>) : <Text style={{ opacity: 0.7 }}>—</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
    },
    text: {
        fontWeight: "700",
        marginBottom: 6,
    },
});
