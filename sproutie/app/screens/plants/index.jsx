import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styles from "./styles";

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.17:3000';

export default function PlantsScreen() {
  const [loading, setLoading] = useState(false);
  const [menuOption, setMenuOption] = useState(0); //0 = my plants, 1 = all, keep an eye on plants
  const [floweringPlants, setFloweringPlants] = useState([]);

  const Menu = () => {
    //This will be a horizontal menu with 3 options: My Plants, All Plants, Keep an Eye On
    return <View style={styles.menuContainer}></View>;
  };

const showFloweringPlants = async () => {
    setLoading(true);
    try {
      console.log("Making request to:", `${API_URL}/api/plants?flower_conspicuous=true&page=1`);
      
      // Direct call to your server route which uses trefleAPI.js
      const response = await fetch(`${API_URL}/api/plants?flower_conspicuous=true&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Flowering Plants Response:", data);
      
      // Trefle API returns data in response.data array
      if (data.data && Array.isArray(data.data)) {
        setFloweringPlants(data.data);
        console.log(`Found ${data.data.length} flowering plants`);
      } else {
        console.log("No flowering plants found or unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching flowering plants:", error);
    } finally {
      setLoading(false);
    }
}

  const header = () => {
    //This will be a header with the title "Sproutie", with small menu icon on the left
    return <View style={styles.headerContainer}></View>;
  };

  const footer = () => {
    //This will be a footer with navigation icons: Home, Plants, Profile
    return <View style={styles.footerContainer}></View>;
  }

  return <View style={styles.container}>
    <View style={styles.plantContainer}>
        <View>
            <Menu />
            <View style={{ marginVertical: 16 }}>
                <TouchableOpacity 
                    onPress={showFloweringPlants} 
                    disabled={loading}
                    style={{ 
                        backgroundColor: loading ? '#cccccc' : '#2e7d32',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {loading ? "Loading..." : "Show Flowering Plants"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
  </View>;
}
