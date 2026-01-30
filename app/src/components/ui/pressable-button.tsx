import { Pressable, StyleSheet, Text } from "react-native";

type PressableButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
};

const PressableButton = ({ title, onPress, disabled }: PressableButtonProps) => {

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            disabled={!!disabled}
        >
            <Text style={styles.title}>{title}</Text>
        </Pressable>
    );
};

export default PressableButton;

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor:'white',
        borderRadius: 12,
        alignItems: "center"
    },
    title: { fontWeight: "600" },
});
