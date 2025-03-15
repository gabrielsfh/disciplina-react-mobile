import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import '@expo/metro-runtime';
import Evento1 from './components/Evento1';
import Evento2 from './components/Evento2';
import Evento3 from './components/Evento3';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator(); 

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Evento1 caracolas" component={Evento1} />
        <Tab.Screen name="Evento2" component={Evento2} />
        <Tab.Screen name="Evento3" component={Evento3} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
