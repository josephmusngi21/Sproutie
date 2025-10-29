/**
 * This component handles requesting and displaying the user's location.
 * It uses device geolocation to fetch coordinates and reverse-geocodes them into a readable address.
 * The location is used to provide personalized plant care recommendations based on local climate.
 */

import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import styles from './styles';
import { getCurrentLocation, getAddressFromCoords } from '../../services/locationService';

export default function LocationRequest() {
    // State to track whether location access has been granted
    const [locationApproved, setLocationApproved] = useState(false);

    // State to track loading status during location fetch
    const [loading, setLoading] = useState(false);

    // Stores the user's raw location data (latitude and longitude)
    const [userLocation, setUserLocation] = useState(null);

    // Stores the user's human-readable address (city, region)
    const [userAddress, setUserAddress] = useState(null);

    /**
     * Handles the location permission request and data retrieval.
     * - Requests current location from device
     * - If successful, reverse-geocodes coordinates into address
     * - Displays appropriate alerts based on success or failure
     */
    const handleLocationRequest = async () => {
        setLoading(true);
        
        try {
            const location = await getCurrentLocation();
            
            if (location) {
                setUserLocation(location);
                setLocationApproved(true);
                
                // Convert coordinates to address
                const addresses = await getAddressFromCoords(
                    location.coords.latitude,
                    location.coords.longitude
                );
                
                if (addresses && addresses[0]) {
                    setUserAddress(addresses[0]);
                }

                // Notify user of successful location retrieval
                Alert.alert(
                    "Location Access Granted",
                    `Successfully retrieved your location: ${addresses?.[0]?.city || 'Unknown area'}`
                );
            } else {
                // Notify user if location access was denied
                Alert.alert(
                    "Location Access Denied",
                    "Please enable location services to get personalized plant care recommendations."
                );
            }
        } catch (error) {
            console.error('Location request error:', error);

            // Notify user of any unexpected errors
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
            
            {/* Show location request button if not yet approved */}
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
                // Show location details once access is granted
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
