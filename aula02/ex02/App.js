import React from 'react';
import { View, StyleSheet, Text } from 'react-native'; // Added Image import
import Greeting from './components/Greeting';
import '@expo/metro-runtime';
import styles from './styles/styles';

export default function App() {
  return (
    <View style={styles.container}>
      <Greeting name="Rafael"/>
      <Text style={styles.text}>IDK MATE</Text>
    </View>
  );
}


