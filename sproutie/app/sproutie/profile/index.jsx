import { View } from "react-native";
import { useState } from "react";
import styles from "./styles";
import apiService from "../../services/apiService";


export default function ProfileScreen(UID) {
    const [loading, setLoading] = useState(false);
    const userInfo = null;

    const fetchUserData = async () => {
        try {
            userInfo = await apiService.getUser(UID);
            setLoading (true)
            console.log("User info fetched from API:", userInfo);
        }catch {
            console.error("Error fetching user info from API");
        }finally {
            setLoading(false);
            console.log("Loading done");
        }
    }
    return (
        <View style={styles.container}>

        </View>
    )
}
