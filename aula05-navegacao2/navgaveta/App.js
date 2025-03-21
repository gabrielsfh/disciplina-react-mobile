import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();
function HomeScreen() {
return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
<Text>Home Screen</Text>
</View>
);
}
function ProfileScreen() {
return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
<Text>Profile Screen</Text>
</View>
);
}

export default function App() {
  return (
  <NavigationContainer>
  <Drawer.Navigator>
  <Drawer.Screen name="Home" component={HomeScreen} />
  <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
  </NavigationContainer>
  );
  }