import { useState } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import styles from "./styles";

// Use the same API base URL as the main API service
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export default function PlantsScreen() {
    const [loading, setLoading] = useState(false);
    const [plants, setPlants] = useState([]);


    const Menu = () => (
        <View style={styles.menuContainer}></View>
    );

    const PlantItem = ({ plant }) => (
        <View style={styles.plantItem}>
            <Text style={styles.plantName}>
                {plant.common_name || 'Unknown Name'}
            </Text>
            <Text style={styles.plantScientificName}>
                {plant.scientific_name}
            </Text>
            {plant.family && (
                <Text style={styles.plantFamily}>
                    Family: {plant.family}
                </Text>
            )}
        </View>
    );

    const showPlants = async () => {
        setLoading(true);
        try {
            const url = `${API_URL}/api/plants`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // The Trefle API returns data in a nested structure
            if (data && data.data) {
                setPlants(data.data);
                console.log(`Loaded ${data.data.length} plants`);
            } else {
                console.log('No plants data received');
                setPlants([]);
            }
        } catch (error) {
            console.error('Error fetching plants:', error);
            alert('Failed to load plants: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const header = () => (
        <View style={styles.headerContainer}></View>
    );

    const footer = () => (
        <View style={styles.footerContainer}></View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.plantContainer}>
                <View>
                    <Menu />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={showPlants}
                            disabled={loading}
                            style={loading ? styles.buttonDisabled : styles.button}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Loading..." : "Show Plants"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Display plants */}
                    {plants.length > 0 && (
                        <View style={styles.plantsListContainer}>
                            <Text style={styles.plantsListTitle}>
                                Plants ({plants.length})
                            </Text>
                            <ScrollView style={styles.plantsScrollView}>
                                {plants.map((plant, index) => (
                                    <PlantItem key={plant.id || index} plant={plant} />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
