import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Evento1 from './components/Evento1';
import Evento2 from './components/Evento2';
import Evento3 from './components/Evento3';
import '@expo/metro-runtime';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Evento1" component={Evento1} />
      <Tab.Screen name="Evento2" component={Evento2} />
      <Tab.Screen name="Evento3" component={Evento3} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Tabs">
        <Drawer.Screen name="Tabs" component={TabNavigator} />
        {/* You can add more Drawer screens here if needed */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;