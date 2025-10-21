import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import styles from './styles';
import { getCurrentLocation, getAddressFromCoords } from '../../services/locationService';

export default function LocationRequest() {
    const [locationApproved, setLocationApproved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState(null);

    const handleLocationRequest = async () => {
        setLoading(true);
        
        try {
            const location = await getCurrentLocation();
            
            if (location) {
                setUserLocation(location);
                setLocationApproved(true);
                
                // Get address from coordinates
                const addresses = await getAddressFromCoords(
                    location.coords.latitude,
                    location.coords.longitude
                );
                
                if (addresses && addresses[0]) {
                    setUserAddress(addresses[0]);
                }
                
                Alert.alert(
                    "Location Access Granted",
                    `Successfully retrieved your location: ${addresses?.[0]?.city || 'Unknown area'}`
                );
            } else {
                Alert.alert(
                    "Location Access Denied",
                    "Please enable location services to get personalized plant care recommendations."
                );
            }
        } catch (error) {
            console.error('Location request error:', error);
            Alert.alert(
                "Location Error",
                "Failed to get your location. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Access</Text>
            <Text style={styles.description}>
                We need your location to provide personalized plant care recommendations based on your local weather and climate.
            </Text>
            
            {!locationApproved ? (
                <TouchableOpacity 
                    style={styles.button}
                    onPress={handleLocationRequest}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Getting Location...' : 'Allow Location Access'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.locationInfo}>
                    <Text style={styles.successText}>✓ Location Access Granted</Text>
                    {userAddress && (
                        <Text style={styles.addressText}>
                            {userAddress.city}, {userAddress.region}
                        </Text>
                    )}
                    {userLocation && (
                        <Text style={styles.coordsText}>
                            Lat: {userLocation.coords.latitude.toFixed(4)}, 
                            Lng: {userLocation.coords.longitude.toFixed(4)}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}