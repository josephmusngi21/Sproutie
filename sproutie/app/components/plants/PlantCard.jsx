import { View, Text } from "react-native";
import styles from "./styles";

export default function PlantCard({ plant }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Plant Card Component</Text>
            <Text style={styles.subtitle}>Ready for implementation</Text>
        </View>
    );
}