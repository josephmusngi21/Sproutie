/**
 * SearchPlants Component
 * 
 * A comprehensive screen for searching plants via Trefle API and managing user's plant collection.
 * Users can search for plants, save them to their collection, view saved plants, and remove them.
 * 
 * Features:
 * - Search plants by name using Trefle API
 * - Save plants to user's collection in MongoDB
 * - Display user's saved plants with images
 * - Remove plants from collection
 * - Real-time duplicate detection (prevents saving same plant twice)
 * 
 * @module screens/plants/searchPlants
 * @requires react-native
 * @requires react
 * @requires ../../../firebase/auth
 */

import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../../../firebase/auth';
import styles from './styles';

// API base URL from environment variables with fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

/**
 * SearchPlants - Main component for plant search and collection management
 * 
 * @component
 * @returns {JSX.Element} The rendered SearchPlants screen
 */
export default function SearchPlants() {
    // ============================================================
    // STATE MANAGEMENT
    // ============================================================
    
    /** Indicates if API request is in progress */
    const [loading, setLoading] = useState(false);
    
    /** Current search query string entered by user */
    const [searchQuery, setSearchQuery] = useState('');
    
    /** Array of plant objects returned from Trefle API search */
    const [searchResults, setSearchResults] = useState([]);
    
    /** Array of user's saved plants from MongoDB */
    const [userPlants, setUserPlants] = useState([]);
    
    /** Set of Trefle IDs for quick duplicate checking - prevents O(n) array lookups */
    const [savedPlantIds, setSavedPlantIds] = useState(new Set());

    // ============================================================
    // API UTILITIES
    // ============================================================
    
    /**
     * Generic API call wrapper with error handling
     * 
     * @async
     * @param {string} endpoint - API endpoint path (e.g., '/api/plants/search')
     * @param {Object} [options={}] - Fetch options (method, headers, body, etc.)
     * @returns {Promise<Object>} Parsed JSON response from API
     * @throws {Error} HTTP error with status code if request fails
     * 
     * @example
     * const data = await apiCall('/api/plants/search?q=rose');
     * const result = await apiCall('/api/plants/save', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ userId, plantData })
     * });
     */
    const apiCall = async (endpoint, options = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    // ============================================================
    // CORE FUNCTIONS - Plant Search & Management
    // ============================================================
    
    /**
     * Search for plants using Trefle API
     * 
     * Validates input, queries the backend which calls Trefle API, and updates search results.
     * Shows user-friendly alerts for empty results or errors.
     * 
     * @async
     * @returns {Promise<void>}
     * 
     * Flow:
     * 1. Validate search query is not empty
     * 2. Set loading state
     * 3. Call backend API with URL-encoded query
     * 4. Update searchResults state with response
     * 5. Show alert if no results found
     * 6. Handle errors with user-friendly messages
     * 
     * @example
     *  User types "rose" and clicks search button
     * searchPlants(); // Calls GET /api/plants/search?q=rose
     */
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

    /**
     * Remove a plant from user's collection
     * 
     * Deletes plant from MongoDB and refreshes the UI. Requires user authentication.
     * Uses RESTful DELETE method with plant ID in URL and user ID in body.
     * 
     * @async
     * @param {string} plantId - MongoDB ObjectId of the plant to remove
     * @param {string} plantName - Display name of plant (for success message)
     * @returns {Promise<void>}
     * 
     * Security:
     * - Backend validates that plant belongs to requesting user (via userId)
     * - Uses Firebase UID for authentication
     * 
     * @example
     * removePlant('67abc123def456', 'Rose');
     * Calls DELETE /api/plants/delete/67abc123def456
     * Shows alert: "Rose removed from your collection!"
     */
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
            
            // Refresh the plants list to reflect deletion
            loadUserPlants();
        } catch (error) {
            console.error('Remove error details:', error);
            alert('Failed to remove: ' + error.message);
        }
    };

    /**
     * Save a plant from search results to user's collection
     * 
     * Saves plant to MongoDB and updates UI state. Backend prevents duplicate saves
     * and automatically links plant to user via Firebase UID.
     * 
     * @async
     * @param {Object} plant - Plant object from Trefle API search results
     * @param {number} plant.id - Trefle API plant ID (used for duplicate detection)
     * @param {string} plant.common_name - Common name (may be null)
     * @param {string} plant.scientific_name - Scientific name (fallback for display)
     * @returns {Promise<void>}
     * 
     * Duplicate Detection:
     * - Backend checks if trefleId + firebaseUid combo exists
     * - Returns 409 Conflict if duplicate
     * - Optimistically updates savedPlantIds Set for immediate UI feedback
     * 
     * Flow:
     * 1. Check user authentication
     * 2. POST plant data with userId to backend
     * 3. Add plant.id to savedPlantIds Set (disables save button)
     * 4. Reload full user plants collection
     * 5. Show success/error alert
     * 
     * @example
     * const searchResult = {
     *   id: 123456,
     *   common_name: 'Rose',
     *   scientific_name: 'Rosa rugosa',
     *   ...
     * };
     * savePlant(searchResult);
     * Saves to MongoDB and disables "Save" button
     */
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
            
            // Optimistic UI update - mark as saved immediately
            setSavedPlantIds(prev => new Set([...prev, plant.id]));
            
            // Fetch full updated collection from backend
            loadUserPlants();
        } catch (error) {
            if (error.message.includes('409')) {
                alert('Plant already saved');
            } else {
                alert('Failed to save: ' + error.message);
            }
        }
    };

    /**
     * Load all plants in user's collection from MongoDB
     * 
     * Fetches user's saved plants and updates both the plants array and the
     * savedPlantIds Set for duplicate detection. Runs on component mount.
     * 
     * @async
     * @returns {Promise<void>}
     * 
     * useCallback Hook:
     * - Memoized to prevent unnecessary rerenders
     * - Empty dependency array [] means function reference never changes
     * - Used in useEffect for component mount
     * 
     * Side Effects:
     * - Updates userPlants state with array of plant objects
     * - Updates savedPlantIds Set with trefleId values for O(1) duplicate checks
     * 
     * Flow:
     * 1. Check if user is authenticated (silent fail if not)
     * 2. GET /api/plants/user/:userId from backend
     * 3. Extract trefleId values and create Set for duplicate detection
     * 4. Update state with plants array and ID Set
     * 5. Log errors but don't show alerts (background operation)
     * 
     * @example
     *  Called on component mount via useEffect
     * useEffect(() => {
     *   loadUserPlants();
     * }, [loadUserPlants]);
     * 
     *  Also called after save/remove operations to refresh list
     * savePlant(plant).then(() => loadUserPlants());
     */
    const loadUserPlants = useCallback(async () => {
        const user = getCurrentUser();
        if (!user) return; // Silent fail - user not logged in

        try {
            const data = await apiCall(`/api/plants/user/${user.uid}`);
            if (data?.data) {
                setUserPlants(data.data);
                // Build Set of saved IDs for O(1) duplicate detection
                setSavedPlantIds(new Set(data.data.map(p => p.trefleId)));
            }
        } catch (error) {
            console.error('Load error:', error);
            // Don't alert - this is a background operation
        }
    }, []); // Empty deps - function reference never changes

    // Load user's plants when component mounts
    useEffect(() => { loadUserPlants(); }, [loadUserPlants]);

    // ==================== COMPONENT RENDERERS ====================
    
    /**
     * Search result item component
     * 
     * Displays individual plant from Trefle API search results with save button.
     * Button is disabled if plant is already in user's collection.
     * 
     * @component
     * @param {Object} props
     * @param {Object} props.plant - Plant data from Trefle API
     */
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

    /**
     * Saved plant item component
     * 
     * Displays individual plant from user's MongoDB collection with remove button.
     * Tapping plant logs detailed information to console for debugging.
     * 
     * @component
     * @param {Object} props
     * @param {Object} props.plant - Plant data from MongoDB (UserPlant model)
     * @param {string} props.plant._id - MongoDB ObjectId for deletion
     * @param {string} props.plant.commonName - Common name (camelCase from DB)
     * @param {string} props.plant.scientificName - Scientific name
     * @param {string} props.plant.imageUrl - Image URL (camelCase from DB)
     */
    const SavedPlantItem = ({ plant }) => {
        /**
         * Log detailed plant information for debugging
         * Useful for checking data structure and troubleshooting
         */
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

    /**
     * Render search interface section
     * 
     * Displays search input, search button, and results list.
     * 
     * Features:
     * - Text input with placeholder examples
     * - Search button with loading spinner
     * - Results count display
     * - Scrollable search results with SearchResultItem components
     * 
     * @returns {JSX.Element}
     */
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

    /**
     * Render saved plants collection section
     * 
     * Displays user's saved plants from MongoDB with refresh button.
     * Shows empty state message if no plants saved.
     * 
     * Features:
     * - Header with plant count and refresh button
     * - List of SavedPlantItem components with remove buttons
     * - Empty state message with call-to-action
     * 
     * @returns {JSX.Element}
     */
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