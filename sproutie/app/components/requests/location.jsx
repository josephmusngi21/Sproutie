import { View, Text, TouchableOpacity, } from 'react-native';
import { useState, } from 'react';
import styles from './styles';

export default function location () {
    const [locationApproved, setLocationApproved] = useState(false);
    const [loading, setLoading] = useState(false);



    return (
        <View style={styles.container}>

        </View>
    )
}