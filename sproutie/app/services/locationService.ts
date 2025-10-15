import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch (error) {
    console.error('Get location error:', error);
    return null;
  }
};

export const getAddressFromCoords = async (latitude: number, longitude: number) => {
  try {
    return await Location.reverseGeocodeAsync({ latitude, longitude });
  } catch (error) {
    console.error('Get address error:', error);
    return null;
  }
};