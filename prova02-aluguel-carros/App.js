// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { StatusBar } from 'expo-status-bar';
import '@expo/metro-runtime'

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
      <StatusBar style='auto'/>
    </NavigationContainer>
  );
}
