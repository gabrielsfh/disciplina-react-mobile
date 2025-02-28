import React from 'react';
import { View } from 'react-native'; // Added Image import
import Greeting from './components/Greeting';
import '@expo/metro-runtime';

export default function App() {
  return (
    // Inline style
    <View style={{
      flex: 0.5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'green'
    }}>
      <Greeting name="Rafael"/>
    </View>
  );
}


