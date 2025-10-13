import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../../../firebase/auth';
import styles from './styles';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';


export default function SearchPlants() {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [userPlants, setUserPlants] = useState([]);
    const [savedPlantIds, setSavedPlantIds] = useState(new Set());

    const apiCall = async (endpoint, options = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    const searchPlants = async () => {
        if (!searchQuery.trim()) return alert('Please enter a search term');
        
        setLoading(true);
        try {
            const data = await apiCall(`/api/plants/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(data?.data || []);
            if (!data?.data?.length) alert('No plants found');
        } catch (error) {
            alert('Failed to search: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const removePlant = async (plantId, plantName) => {
        const user = getCurrentUser();
        if (!user) return alert('Please log in to remove plants');
        
        console.log('Removing plant:', plantId, 'for user:', user.uid);
        
        try {
            const response = await apiCall(`/api/plants/delete/${plantId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });
            
            console.log('Plant removed successfully:', response);
            alert(`${plantName} removed from your collection!`);
            
            // Update UI - reload plants
            loadUserPlants();
        } catch (error) {
            console.error('Remove error details:', error);
            alert('Failed to remove: ' + error.message);
        }
    };

    const savePlant = async (plant) => {
        const user = getCurrentUser();
        if (!user) return alert('Please log in to save plants');

        console.log('Saving plant for user:', user.uid);
        console.log('Plant data:', plant);

        try {
            const response = await apiCall('/api/plants/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, plantData: plant })
            });
            
            console.log('Plant saved successfully:', response);
            alert(`${plant.common_name || plant.scientific_name} saved!`);
            setSavedPlantIds(prev => new Set([...prev, plant.id]));
            loadUserPlants();
        } catch (error) {
            if (error.message.includes('409')) {
                alert('Plant already saved');
            } else {
                alert('Failed to save: ' + error.message);
            }
        }
    };

    const loadUserPlants = useCallback(async () => {
        const user = getCurrentUser();
        if (!user) return;

        try {
            const data = await apiCall(`/api/plants/user/${user.uid}`);
            if (data?.data) {
                setUserPlants(data.data);
                setSavedPlantIds(new Set(data.data.map(p => p.trefleId)));
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    }, []);

    useEffect(() => { loadUserPlants(); }, [loadUserPlants]);

    // Plant search result item
    const SearchResultItem = ({ plant }) => (
        <View style={styles.plantItem}>
            {plant.image_url && (
                <Image 
                    source={{ uri: plant.image_url }} 
                    style={styles.plantImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.plantInfo}>
                <Text style={styles.plantName}>
                    {plant.common_name || 'No common name'}
                </Text>
                <Text style={styles.plantScientificName}>
                    {plant.scientific_name}
                </Text>
                {plant.family && (
                    <Text style={styles.plantFamily}>
                        {plant.family}
                    </Text>
                )}
                {plant.year && (
                    <Text style={styles.plantYear}>Year: {plant.year}</Text>
                )}
            </View>
            <TouchableOpacity 
                style={[
                    styles.saveButton,
                    savedPlantIds.has(plant.id) && styles.saveButtonDisabled
                ]}
                onPress={() => savePlant(plant)}
                disabled={savedPlantIds.has(plant.id)}
            >
                <Text style={styles.saveButtonText}>
                    {savedPlantIds.has(plant.id) ? '✓ Saved' : '+ Add'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    // User's saved plant item
    const SavedPlantItem = ({ plant }) => {
        const handlePlantPress = () => {
            console.log('========== PLANT INFO ==========');
            console.log('🌿 Common Name:', plant.commonName || 'N/A');
            console.log('🔬 Scientific Name:', plant.scientificName);
            console.log('👨‍🔬 Family:', plant.family);
            console.log('🧬 Genus:', plant.genus);
            console.log('📊 Rank:', plant.rank);
            console.log('📋 Status:', plant.status);
            console.log('🆔 Trefle ID:', plant.trefleId);
            console.log('================================');
            console.log('💡 Tip: Use Trefle ID to fetch detailed care info from API');
        };

        const handleRemove = () => {
            const plantName = plant.commonName || plant.scientificName;
            removePlant(plant._id, plantName);
        };

        return (
            <View style={styles.savedPlantItem}>
                <TouchableOpacity 
                    style={styles.savedPlantContent}
                    onPress={handlePlantPress}
                    activeOpacity={0.7}
                >
                    {plant.imageUrl && (
                        <Image 
                            source={{ uri: plant.imageUrl }} 
                            style={styles.plantImageSmall}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.savedPlantInfo}>
                        <Text style={styles.savedPlantName}>
                            {plant.commonName || plant.scientificName}
                        </Text>
                        {plant.family && (
                            <Text style={styles.savedPlantFamily}>
                                {plant.family}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
                
                {/* Remove Button */}
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={handleRemove}
                    activeOpacity={0.7}
                >
                    <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render search section with results
    const renderSearchSection = () => (
        <View style={styles.searchSection}>
            <Text style={styles.title}>Search Plants</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for plants (e.g., coconut, rose, oak)..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={searchPlants}
                />
                <TouchableOpacity 
                    style={[styles.searchButton, loading && styles.buttonDisabled]}
                    onPress={searchPlants}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.searchButtonText}>🔍 Search</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <View style={styles.resultsSection}>
                    <Text style={styles.resultsTitle}>
                        Found {searchResults.length} plants
                    </Text>
                    {searchResults.map((plant) => (
                        <SearchResultItem key={plant.id} plant={plant} />
                    ))}
                </View>
            )}
        </View>
    );

    // Render user's saved plants section
    const renderSavedPlants = () => (
        <View style={styles.savedSection}>
            <View style={styles.savedHeader}>
                <Text style={styles.savedTitle}>My Plants ({userPlants.length})</Text>
                <TouchableOpacity onPress={loadUserPlants}>
                    <Text style={styles.refreshButton}>🔄 Refresh</Text>
                </TouchableOpacity>
            </View>
            
            {userPlants.length > 0 ? (
                userPlants.map((plant) => (
                    <SavedPlantItem key={plant._id} plant={plant} />
                ))
            ) : (
                <Text style={styles.emptyText}>
                    No plants saved yet. Search and add plants above!
                </Text>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {renderSearchSection()}
            {renderSavedPlants()}
        </ScrollView>
    );
}