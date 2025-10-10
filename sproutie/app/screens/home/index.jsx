import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import PlantsScreen from '../plants/index';
import SearchPlants from '../plants/searchPlants/index';
import ProfileScreen from '../profile/index';
import styles from './styles';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('plants');

  const renderContent = () => {
    switch (activeTab) {
      case 'plants':
        return <PlantsScreen />;
      case 'search':
        return <SearchPlants />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <PlantsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'plants' && styles.activeTab]}
          onPress={() => setActiveTab('plants')}
        >
          <Text style={[styles.tabIcon, activeTab === 'plants' && styles.activeTabIcon]}>
            🌱
          </Text>
          <Text style={[styles.tabText, activeTab === 'plants' && styles.activeTabText]}>
            Plants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabIcon, activeTab === 'search' && styles.activeTabIcon]}>
            🔍
          </Text>
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]}>
            ⚙️
          </Text>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
